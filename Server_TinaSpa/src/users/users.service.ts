import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { AuthUser } from '../auth/types/auth-user.js';
import { BranchesService } from '../branches/branches.service.js';
import { RoleName } from '../common/constants/roles.js';
import {
  customersInBranchWhere,
  isAdmin,
  scopedBranchAID,
  usersInBranchWhere,
} from '../common/scope/branch-scope.js';
import { normalizePhone, phoneVariants } from '../common/utils/phone.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateStaffDto } from './dto/create-staff.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import type { UpdateStaffDto } from './dto/update-staff.dto.js';
import type { ListUsersQueryDto } from './dto/list-users.dto.js';

const BCRYPT_SALT_ROUNDS = 12;

export const USER_BRANCH_INCLUDE = {
  branch: { select: { branchID: true, nameVietnamese: true } },
} satisfies Prisma.UserInclude;

export type UserRecord = User & {
  branch?: { branchID: string; nameVietnamese: string } | null;
};

export type PublicUser = {
  userID: string;
  phone: string;
  fullName: string;
  avatar: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  branchAID: string | null;
  branchID: string | null;
  branchName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const DETAIL_LIMIT = 50;

export type UserDetailResponse = {
  user: PublicUser;
  stats: {
    /** Units of service (sum of quantity). */
    serviceCount: number;
    serviceTotal: number;
    lastServiceAt: Date | null;
    appointmentCount: number;
    completedAppointments: number;
    cancelledAppointments: number;
  };
  /** Latest {@link DETAIL_LIMIT} records. */
  services: {
    customerServiceID: string;
    serviceID: string;
    nameVietnamese: string;
    price: number;
    quantity: number;
    usedAt: Date;
    staffNote: string | null;
    branchName: string | null;
    /** Set for staff accounts: whom the service was recorded for. */
    customer: { userID: string; fullName: string; phone: string } | null;
  }[];
  appointments: {
    appointmentID: string;
    customerName: string;
    phoneNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    branchName: string;
    customerNote: string | null;
    serviceNote: string | null;
  }[];
};

export type UserListResponse = {
  items: PublicUser[];
  total: number;
  page: number;
  pageSize: number;
  roleCounts: Partial<Record<RoleName, number>>;
};

/** Roles whose accounts each viewer may list; only ADMIN sees MANAGER accounts. ADMIN accounts are never listed. */
export function visibleRolesFor(viewerRoles: readonly string[]): RoleName[] {
  if (viewerRoles.includes(RoleName.ADMIN)) {
    return [RoleName.MANAGER, RoleName.STAFF, RoleName.CUSTOMER];
  }
  if (viewerRoles.includes(RoleName.MANAGER)) {
    return [RoleName.CUSTOMER, RoleName.STAFF];
  }
  if (viewerRoles.includes(RoleName.STAFF)) {
    return [RoleName.CUSTOMER];
  }
  return [];
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branches: BranchesService,
  ) {}

  /** Matches either spelling (0901... or +84901...) so older accounts keep working. */
  findByPhone(phone: string): Promise<UserRecord | null> {
    return this.prisma.user.findFirst({
      where: { phone: { in: phoneVariants(normalizePhone(phone)) } },
      include: USER_BRANCH_INCLUDE,
    });
  }

  findByUserID(userID: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({
      where: { userID },
      include: USER_BRANCH_INCLUDE,
    });
  }

  findByUserAID(userAID: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({
      where: { userAID },
      include: USER_BRANCH_INCLUDE,
    });
  }

  create(data: {
    phone: string;
    passwordHash: string;
    fullName: string;
  }): Promise<UserRecord> {
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: RoleName.CUSTOMER,
      },
      include: USER_BRANCH_INCLUDE,
    });
  }

  async list(
    query: ListUsersQueryDto,
    actor: AuthUser,
  ): Promise<UserListResponse> {
    const { search, role, isActive, page, pageSize } = query;
    const visibleRoles = visibleRolesFor(actor.roles);
    if (role && !visibleRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }

    const branchAID = await this.resolveListBranchAID(actor, query.branchID);
    const scopedRoles = role ? [role] : visibleRoles;
    const roleScope: Prisma.UserWhereInput = branchAID
      ? usersInBranchWhere(branchAID, scopedRoles)
      : { role: { in: scopedRoles } };
    const countScope: Prisma.UserWhereInput = branchAID
      ? usersInBranchWhere(branchAID, visibleRoles)
      : { role: { in: visibleRoles } };

    const filters: Prisma.UserWhereInput[] = [
      ...(isActive === undefined ? [] : [{ isActive }]),
      ...(search
        ? [
            {
              OR: [
                {
                  fullName: { contains: search, mode: 'insensitive' as const },
                },
                { phone: { contains: search } },
                { userID: { contains: search } },
                { address: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          ]
        : []),
    ];
    const where: Prisma.UserWhereInput = { AND: [roleScope, ...filters] };
    const baseWhere: Prisma.UserWhereInput = { AND: [countScope, ...filters] };

    const [users, total, groups] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: USER_BRANCH_INCLUDE,
        orderBy: [{ createdAt: 'desc' }, { userID: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
      this.prisma.user.groupBy({
        by: ['role'],
        where: baseWhere,
        orderBy: { role: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const roleCounts: Partial<Record<RoleName, number>> = Object.fromEntries(
      visibleRoles.map((name) => [name, 0]),
    );
    for (const group of groups) {
      const count = group._count;
      if (group.role in roleCounts && typeof count === 'object') {
        roleCounts[group.role as RoleName] = count._all ?? 0;
      }
    }

    return {
      items: users.map((user) => this.toPublicUser(user)),
      total,
      page,
      pageSize,
      roleCounts,
    };
  }

  async createStaff(dto: CreateStaffDto, actor: AuthUser): Promise<PublicUser> {
    const admin = isAdmin(actor.roles);
    const role = dto.role ?? RoleName.STAFF;
    if (role === RoleName.MANAGER && !admin) {
      throw new ForbiddenException('Insufficient role');
    }

    let branchAID: string;
    if (admin) {
      if (!dto.branchID) {
        throw new BadRequestException('branchID is required');
      }
      branchAID = (await this.branches.getActiveRecord(dto.branchID)).branchAID;
    } else {
      if (!actor.branchAID) {
        throw new ForbiddenException('Account is not assigned to a branch');
      }
      branchAID = actor.branchAID;
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    try {
      const user = await this.prisma.user.create({
        data: {
          phone: normalizePhone(dto.phone),
          passwordHash,
          fullName: dto.fullName,
          avatar: dto.avatar || null,
          address: dto.address || null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender ?? null,
          role,
          branchAID,
          createdByAID: actor.userAID,
          updatedByAID: actor.userAID,
          note: dto.note || null,
        },
        include: USER_BRANCH_INCLUDE,
      });
      return this.toPublicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Phone number already registered');
      }
      throw error;
    }
  }

  /**
   * ADMIN sửa MANAGER/STAFF ở mọi khu vực và được chuyển khu vực;
   * MANAGER chỉ sửa STAFF thuộc khu vực mình, không chuyển khu vực.
   */
  async updateStaff(
    userID: string,
    dto: UpdateStaffDto,
    actor: AuthUser,
  ): Promise<PublicUser> {
    const target = await this.getManageableUser(userID, actor, [
      RoleName.STAFF,
      ...(isAdmin(actor.roles) ? [RoleName.MANAGER] : []),
    ]);

    let branchAID: string | undefined;
    if (dto.branchID && dto.branchID !== target.branch?.branchID) {
      if (!isAdmin(actor.roles)) {
        throw new ForbiddenException(
          'Only ADMIN can move staff to another branch',
        );
      }
      branchAID = (await this.branches.getActiveRecord(dto.branchID)).branchAID;
    }
    if (dto.dateOfBirth && new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException('dateOfBirth must not be in the future');
    }

    const optional = (value: string | null | undefined) =>
      value === undefined ? undefined : value || null;
    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS)
      : undefined;

    try {
      const [user] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { userAID: target.userAID },
          data: {
            fullName: dto.fullName,
            phone: dto.phone ? normalizePhone(dto.phone) : undefined,
            passwordHash,
            gender: dto.gender === undefined ? undefined : (dto.gender ?? null),
            dateOfBirth:
              dto.dateOfBirth === undefined
                ? undefined
                : dto.dateOfBirth
                  ? new Date(dto.dateOfBirth)
                  : null,
            address: optional(dto.address),
            avatar: optional(dto.avatar),
            note: optional(dto.note),
            branchAID,
            updatedByAID: actor.userAID,
          },
          include: USER_BRANCH_INCLUDE,
        }),
        // Đổi mật khẩu hoặc chuyển khu vực: buộc đăng nhập lại.
        ...(passwordHash || branchAID
          ? [this.revokeSessions(target.userAID)]
          : []),
      ]);
      return this.toPublicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Phone number already registered');
      }
      throw error;
    }
  }

  /**
   * Khóa / mở khóa: ADMIN với mọi tài khoản không phải ADMIN;
   * MANAGER với STAFF và khách hàng trong khu vực mình. Khóa thì thu hồi phiên đăng nhập.
   */
  async setActive(
    userID: string,
    isActive: boolean,
    actor: AuthUser,
  ): Promise<PublicUser> {
    const target = await this.getManageableUser(
      userID,
      actor,
      isAdmin(actor.roles)
        ? [RoleName.MANAGER, RoleName.STAFF, RoleName.CUSTOMER]
        : [RoleName.STAFF, RoleName.CUSTOMER],
    );
    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { userAID: target.userAID },
        data: { isActive, updatedByAID: actor.userAID },
        include: USER_BRANCH_INCLUDE,
      }),
      ...(isActive ? [] : [this.revokeSessions(target.userAID)]),
    ]);
    return this.toPublicUser(user);
  }

  /**
   * Xóa hẳn tài khoản; cùng phạm vi quyền với khóa / mở khóa.
   * Chỉ áp dụng cho tài khoản chưa phát sinh dữ liệu (lịch hẹn, dịch vụ, bài viết) để không mất lịch sử;
   * tài khoản đã có dữ liệu thì khóa thay vì xóa.
   */
  async remove(userID: string, actor: AuthUser): Promise<void> {
    const target = await this.getManageableUser(
      userID,
      actor,
      isAdmin(actor.roles)
        ? [RoleName.MANAGER, RoleName.STAFF, RoleName.CUSTOMER]
        : [RoleName.STAFF, RoleName.CUSTOMER],
    );
    const usage = await this.prisma.user.findUnique({
      where: { userAID: target.userAID },
      select: {
        _count: {
          select: {
            appointments: true,
            confirmedAppointments: true,
            servedAppointments: true,
            customerServices: true,
            authoredBlogs: true,
          },
        },
      },
    });
    if (usage && Object.values(usage._count).some((count) => count > 0)) {
      throw new ConflictException('User has history; lock the account instead');
    }
    await this.prisma.user.delete({ where: { userAID: target.userAID } });
  }

  /**
   * Hồ sơ một tài khoản cho trang chi tiết: thông tin, thống kê, dịch vụ và lịch hẹn gần nhất.
   * Khách hàng: dịch vụ đã dùng và lịch đã đặt. Nhân viên/quản lý: dịch vụ đã ghi nhận và lịch đã xác nhận / phục vụ.
   * MANAGER/STAFF chỉ thấy dữ liệu phát sinh ở khu vực của mình.
   */
  async getDetail(
    userID: string,
    actor: AuthUser,
  ): Promise<UserDetailResponse> {
    const target = await this.getManageableUser(
      userID,
      actor,
      visibleRolesFor(actor.roles),
      true,
    );
    const scope = scopedBranchAID(actor);
    const isCustomer = target.role === RoleName.CUSTOMER;

    const serviceWhere: Prisma.CustomerServiceWhereInput = {
      deletedAt: null,
      ...(isCustomer
        ? { customerAID: target.userAID }
        : { createdByAID: target.userAID }),
      ...(scope ? { branchAID: scope } : {}),
    };
    const appointmentWhere: Prisma.AppointmentWhereInput = {
      ...(isCustomer
        ? {
            OR: [
              { customerAID: target.userAID },
              {
                phoneNumber: {
                  in: phoneVariants(normalizePhone(target.phone)),
                },
              },
            ],
          }
        : {
            OR: [
              { confirmedByAID: target.userAID },
              { servedByAID: target.userAID },
            ],
          }),
      ...(scope ? { branchAID: scope } : {}),
    };

    const [services, serviceRows, appointments, appointmentGroups] =
      await Promise.all([
        this.prisma.customerService.findMany({
          where: serviceWhere,
          include: {
            service: { select: { serviceID: true } },
            customer: { select: { userID: true, fullName: true, phone: true } },
            branch: { select: { nameVietnamese: true } },
          },
          orderBy: [{ usedAt: 'desc' }, { customerServiceID: 'desc' }],
          take: DETAIL_LIMIT,
        }),
        this.prisma.customerService.findMany({
          where: serviceWhere,
          select: { priceSnapshot: true, quantity: true, usedAt: true },
        }),
        this.prisma.appointment.findMany({
          where: appointmentWhere,
          include: { branch: { select: { nameVietnamese: true } } },
          orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'desc' }],
          take: DETAIL_LIMIT,
        }),
        this.prisma.appointment.groupBy({
          by: ['status'],
          where: appointmentWhere,
          orderBy: { status: 'asc' },
          _count: { _all: true },
        }),
      ]);

    const appointmentCounts = Object.fromEntries(
      appointmentGroups.map((group) => [
        group.status,
        typeof group._count === 'object' ? (group._count._all ?? 0) : 0,
      ]),
    );

    return {
      user: this.toPublicUser(target),
      stats: {
        serviceCount: serviceRows.reduce((sum, row) => sum + row.quantity, 0),
        serviceTotal: serviceRows.reduce(
          (sum, row) => sum + row.priceSnapshot.toNumber() * row.quantity,
          0,
        ),
        lastServiceAt: serviceRows.reduce<Date | null>(
          (latest, row) =>
            !latest || row.usedAt > latest ? row.usedAt : latest,
          null,
        ),
        appointmentCount: Object.values(appointmentCounts).reduce(
          (sum, count) => sum + count,
          0,
        ),
        completedAppointments: appointmentCounts.COMPLETED ?? 0,
        cancelledAppointments: appointmentCounts.CANCELLED ?? 0,
      },
      services: services.map((record) => ({
        customerServiceID: record.customerServiceID,
        serviceID: record.service.serviceID,
        nameVietnamese: record.nameVietnamese,
        price: record.priceSnapshot.toNumber(),
        quantity: record.quantity,
        usedAt: record.usedAt,
        staffNote: record.staffNote,
        branchName: record.branch?.nameVietnamese ?? null,
        customer: isCustomer ? null : record.customer,
      })),
      appointments: appointments.map((record) => ({
        appointmentID: record.appointmentID,
        customerName: record.customerName,
        phoneNumber: record.phoneNumber,
        appointmentDate: record.appointmentDate.toISOString().slice(0, 10),
        appointmentTime: record.appointmentTime,
        status: record.status,
        branchName: record.branch.nameVietnamese,
        customerNote: record.customerNote,
        serviceNote: record.serviceNote,
      })),
    };
  }

  /** Staff-created customer account: the phone number is the initial password and must be changed. */
  async createCustomerWithDefaultPassword(
    phone: string,
    fullName: string,
    actorAID: string,
    branchAID?: string | null,
  ): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(phone, BCRYPT_SALT_ROUNDS);
    try {
      const user = await this.prisma.user.create({
        data: {
          phone,
          passwordHash,
          fullName,
          role: RoleName.CUSTOMER,
          mustChangePassword: true,
          branchAID: branchAID ?? null,
          createdByAID: actorAID,
          updatedByAID: actorAID,
        },
        include: USER_BRANCH_INCLUDE,
      });
      return this.toPublicUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Phone number already registered');
      }
      throw error;
    }
  }

  async changePassword(
    userAID: string,
    passwordHash: string,
  ): Promise<UserRecord> {
    return this.prisma.user.update({
      where: { userAID },
      data: { passwordHash, mustChangePassword: false, updatedByAID: userAID },
      include: USER_BRANCH_INCLUDE,
    });
  }

  async updateProfile(
    userAID: string,
    dto: UpdateProfileDto,
  ): Promise<UserRecord> {
    if (dto.dateOfBirth && new Date(dto.dateOfBirth) > new Date()) {
      throw new BadRequestException('dateOfBirth must not be in the future');
    }
    const optional = (value: string | null | undefined) =>
      value === undefined ? undefined : value || null;

    return this.prisma.user.update({
      where: { userAID },
      data: {
        fullName: dto.fullName,
        avatar: optional(dto.avatar),
        address: optional(dto.address),
        gender: dto.gender,
        dateOfBirth:
          dto.dateOfBirth === undefined
            ? undefined
            : dto.dateOfBirth
              ? new Date(dto.dateOfBirth)
              : null,
        updatedByAID: userAID,
      },
      include: USER_BRANCH_INCLUDE,
    });
  }

  getRoleNames(user: User): string[] {
    return [user.role];
  }

  toPublicUser(user: UserRecord): PublicUser {
    return {
      userID: user.userID,
      phone: user.phone,
      fullName: user.fullName,
      avatar: user.avatar,
      address: user.address,
      dateOfBirth: user.dateOfBirth?.toISOString().slice(0, 10) ?? null,
      gender: user.gender,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      branchAID: user.branchAID ?? null,
      branchID: user.branch?.branchID ?? null,
      branchName: user.branch?.nameVietnamese ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /** Target must have one of `roles`, not be the actor (unless `allowSelf`), and (for non-ADMIN) be inside the actor's branch. */
  private async getManageableUser(
    userID: string,
    actor: AuthUser,
    roles: readonly RoleName[],
    allowSelf = false,
  ): Promise<UserRecord> {
    const target = await this.findByUserID(userID);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    if (!allowSelf && target.userAID === actor.userAID) {
      throw new ForbiddenException(
        'Use your profile to change your own account',
      );
    }
    if (!roles.includes(target.role as RoleName)) {
      throw new ForbiddenException('Insufficient role');
    }
    const scope = scopedBranchAID(actor);
    if (scope) {
      const inBranch =
        target.role === RoleName.CUSTOMER
          ? await this.prisma.user.findFirst({
              where: {
                userAID: target.userAID,
                ...customersInBranchWhere(scope),
              },
              select: { userAID: true },
            })
          : target.branchAID === scope;
      if (!inBranch) {
        throw new NotFoundException('User not found');
      }
    }
    return target;
  }

  private revokeSessions(userAID: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userAID, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async resolveListBranchAID(
    actor: AuthUser,
    requestedBranchID?: string,
  ): Promise<string | null> {
    const scope = scopedBranchAID(actor);
    if (scope) {
      if (requestedBranchID) {
        const branch = await this.branches.getByBranchID(requestedBranchID);
        if (branch.branchAID !== scope) {
          throw new ForbiddenException('Cannot list users outside your branch');
        }
      }
      return scope;
    }
    if (!requestedBranchID) return null;
    return (await this.branches.getByBranchID(requestedBranchID)).branchAID;
  }
}
