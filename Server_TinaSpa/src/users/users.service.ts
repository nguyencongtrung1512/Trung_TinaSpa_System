import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../common/constants/roles.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateStaffDto } from './dto/create-staff.dto.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { USER_ROLES, type ListUsersQueryDto } from './dto/list-users.dto.js';

const BCRYPT_SALT_ROUNDS = 12;

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
  return viewerRoles.includes(RoleName.ADMIN)
    ? USER_ROLES
    : [RoleName.CUSTOMER, RoleName.STAFF];
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  findByUserID(userID: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { userID } });
  }

  findByUserAID(userAID: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { userAID } });
  }

  create(data: {
    phone: string;
    passwordHash: string;
    fullName: string;
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        role: RoleName.CUSTOMER,
      },
    });
  }

  async list(
    query: ListUsersQueryDto,
    viewerRoles: readonly string[],
  ): Promise<UserListResponse> {
    const { search, role, isActive, page, pageSize } = query;
    const visibleRoles = visibleRolesFor(viewerRoles);
    if (role && !visibleRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }

    // roleCounts ignores the role filter so every tab keeps its badge.
    const baseWhere: Prisma.UserWhereInput = {
      role: { in: visibleRoles },
      ...(isActive === undefined ? {} : { isActive }),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { userID: { contains: search } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const where: Prisma.UserWhereInput = role
      ? { ...baseWhere, role }
      : baseWhere;

    const [users, total, groups] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
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
    actorAID: string,
  ): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    try {
      const user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          passwordHash,
          fullName: dto.fullName,
          avatar: dto.avatar || null,
          address: dto.address || null,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender ?? null,
          role: RoleName.STAFF,
          createdByAID: actorAID,
          updatedByAID: actorAID,
          note: dto.note || null,
        },
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

  async updateProfile(userAID: string, dto: UpdateProfileDto): Promise<User> {
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
    });
  }

  getRoleNames(user: User): string[] {
    return [user.role];
  }

  toPublicUser(user: User): PublicUser {
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
