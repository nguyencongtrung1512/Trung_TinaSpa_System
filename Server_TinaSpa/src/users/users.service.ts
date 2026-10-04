import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { RoleName } from '../common/constants/roles.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type PublicUser = {
  userID: string;
  phone: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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

  getRoleNames(user: User): string[] {
    return [user.role];
  }

  toPublicUser(user: User): PublicUser {
    return {
      userID: user.userID,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
