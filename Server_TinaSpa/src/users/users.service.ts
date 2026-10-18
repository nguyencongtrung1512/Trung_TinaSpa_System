import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { AuthUser } from '../auth/types/auth-user.js';
import { BranchesService } from '../branches/branches.service.js';
import { RoleName } from '../common/constants/roles.js';
import {
  isAdmin,
  scopedBranchAID,
  usersInBranchWhere,
} from '../common/scope/branch-scope.js';
import { normalizePhone, phoneVariants } from '../common/utils/phone.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateStaffDto } from './dto/create-staff.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { USER_ROLES, type ListUsersQueryDto } from './dto/list-users.dto.js';

const BCRYPT_SALT_ROUNDS = 12;

export const USER_BRANCH_INCLUDE = {
  branch: { select: { branchID: true } },
} satisfies Prisma.UserInclude;

export type UserRecord = User & { branch?: { branchID: string } | null };

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
  createdAt: Date;
  updatedAt: Date;
};

export type UserListResponse = {
  items: PublicUser[];
  total: number;
  page: number;
  pageSize: number;
  roleCounts: Partial<Record<RoleName, number>>;
};

/** Roles whose accounts each viewer may list; only ADMIN sees MANAGER/ADMIN accounts. */
export function visibleRolesFor(viewerRoles: readonly string[]): RoleName[] {
  if (viewerRoles.includes(RoleName.ADMIN)) {
    return USER_ROLES;
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
                { fullName: { contains: search, mode: 'insensitive' as const } },
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

  async createStaff(
    dto: CreateStaffDto,
    actor: AuthUser,
  ): Promise<PublicUser> {
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

  async updateProfile(userAID: string, dto: UpdateProfileDto): Promise<UserRecord> {
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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
