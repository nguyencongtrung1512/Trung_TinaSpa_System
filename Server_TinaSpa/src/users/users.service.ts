import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { RoleName } from '../common/constants/roles.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type UserWithRoles = User & {
  userRoles: Array<{ role: { name: string } }>;
};

export type PublicUser = {
  id: string;
  phone: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  findById(id: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  create(data: {
    phone: string;
    passwordHash: string;
    fullName: string;
  }): Promise<UserWithRoles> {
    return this.prisma.user.create({
      data: {
        phone: data.phone,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        userRoles: {
          create: {
            role: {
              connect: { name: RoleName.CUSTOMER },
            },
          },
        },
      },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });
  }

  getRoleNames(user: UserWithRoles): string[] {
    return user.userRoles.map((userRole) => userRole.role.name);
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
