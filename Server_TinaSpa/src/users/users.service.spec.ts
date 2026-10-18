import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user.js';
import { BranchesService } from '../branches/branches.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
    user: Record<
      'findMany' | 'count' | 'groupBy' | 'create' | 'update',
      ReturnType<typeof vi.fn>
    >;
  };
  let branches: {
    getActiveRecord: ReturnType<typeof vi.fn>;
    getByBranchID: ReturnType<typeof vi.fn>;
  };

  const now = new Date();
  const customer = {
    userAID: '20261004000101',
    userID: '20261004000202',
    phone: '0901234567',
    passwordHash: 'hash',
    fullName: 'Nguyễn Thị Lan',
    avatar: null,
    address: 'Quận 1, TP.HCM',
    dateOfBirth: new Date('1995-03-08T00:00:00.000Z'),
    gender: 'FEMALE',
    role: 'CUSTOMER',
    isActive: true,
    mustChangePassword: false,
    branchAID: null,
    branch: null,
    createdAt: now,
    createdByAID: null,
    updatedAt: now,
    updatedByAID: null,
    note: null,
  };

  const admin: AuthUser = {
    userAID: 'admin-aid',
    userID: 'admin-id',
    phone: '0900000000',
    fullName: 'Admin',
    isActive: true,
    roles: ['ADMIN'],
    branchAID: null,
    branchID: null,
  };

  const manager: AuthUser = {
    userAID: 'mgr-aid',
    userID: 'mgr-id',
    phone: '0900000001',
    fullName: 'Manager',
    isActive: true,
    roles: ['MANAGER'],
    branchAID: 'branch-aid',
    branchID: 'BR001',
  };

  beforeEach(async () => {
    prisma = {
      $transaction: vi.fn((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
      user: {
        findMany: vi.fn().mockResolvedValue([customer]),
        count: vi.fn().mockResolvedValue(1),
        groupBy: vi.fn().mockResolvedValue([
          { role: 'CUSTOMER', _count: { _all: 12 } },
          { role: 'STAFF', _count: { _all: 3 } },
        ]),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(customer),
      },
    };
    branches = {
      getActiveRecord: vi.fn().mockResolvedValue({
        branchAID: 'branch-aid',
        branchID: 'BR001',
      }),
      getByBranchID: vi.fn().mockResolvedValue({
        branchAID: 'branch-aid',
        branchID: 'BR001',
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: BranchesService, useValue: branches },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('paginates, filters and never exposes secrets', async () => {
    const result = await service.list(
      {
        search: 'lan',
        role: 'CUSTOMER',
        isActive: true,
        page: 2,
        pageSize: 10,
      },
      admin,
    );

    const args = prisma.user.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.where.AND[0]).toEqual({ role: { in: ['CUSTOMER'] } });
    expect(args.where.AND).toEqual(
      expect.arrayContaining([{ isActive: true }]),
    );
    expect(args.include).toEqual({ branch: { select: { branchID: true } } });
    expect(prisma.user.groupBy.mock.calls[0][0].where.AND[0]).toEqual({
      role: { in: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'] },
    });

    expect(result.roleCounts).toEqual({
      ADMIN: 0,
      MANAGER: 0,
      STAFF: 3,
      CUSTOMER: 12,
    });
    expect(result.items[0]).not.toHaveProperty('passwordHash');
    expect(result.items[0]).not.toHaveProperty('userAID');
    expect(result.items[0].dateOfBirth).toBe('1995-03-08');
    expect(result.items[0].branchID).toBeNull();
  });

  it('limits managers to customer and staff accounts in their branch', async () => {
    const result = await service.list({ page: 1, pageSize: 20 }, manager);

    expect(prisma.user.findMany.mock.calls[0][0].where.AND[0]).toEqual({
      OR: [
        { role: { in: ['STAFF'] }, branchAID: 'branch-aid' },
        {
          role: 'CUSTOMER',
          OR: [
            { branchAID: 'branch-aid' },
            { appointments: { some: { branchAID: 'branch-aid' } } },
          ],
        },
      ],
    });
    expect(result.roleCounts).toEqual({ CUSTOMER: 12, STAFF: 3 });
    await expect(
      service.list({ role: 'ADMIN', page: 1, pageSize: 20 }, manager),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('limits staff to only customer accounts in their branch', async () => {
    const staff: AuthUser = {
      userAID: 'staff-aid',
      userID: 'staff-id',
      phone: '0900000002',
      fullName: 'Staff',
      isActive: true,
      roles: ['STAFF'],
      branchAID: 'branch-aid',
      branchID: 'BR001',
    };

    const result = await service.list({ page: 1, pageSize: 20 }, staff);

    expect(prisma.user.findMany.mock.calls[0][0].where.AND[0]).toEqual({
      role: 'CUSTOMER',
      OR: [
        { branchAID: 'branch-aid' },
        { appointments: { some: { branchAID: 'branch-aid' } } },
      ],
    });
    expect(result.roleCounts).toEqual({ CUSTOMER: 12 });
    await expect(
      service.list({ role: 'STAFF', page: 1, pageSize: 20 }, staff),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.list({ role: 'ADMIN', page: 1, pageSize: 20 }, staff),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('updates only provided profile fields and clears blanks', async () => {
    await service.updateProfile('self-aid', {
      fullName: 'Lan Nguyễn',
      address: '',
      gender: null,
    });

    const { where, data } = prisma.user.update.mock.calls[0][0];
    expect(where).toEqual({ userAID: 'self-aid' });
    expect(data).toMatchObject({
      fullName: 'Lan Nguyễn',
      address: null,
      gender: null,
      updatedByAID: 'self-aid',
    });
    expect(data.avatar).toBeUndefined();
    expect(data.dateOfBirth).toBeUndefined();
    expect(data).not.toHaveProperty('role');
    expect(data).not.toHaveProperty('phone');

    await expect(
      service.updateProfile('self-aid', { dateOfBirth: '2999-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates staff accounts with audit fields and rejects duplicate phones', async () => {
    prisma.user.create.mockResolvedValueOnce({
      ...customer,
      role: 'STAFF',
      branchAID: 'branch-aid',
      branch: { branchID: 'BR001' },
    });
    const created = await service.createStaff(
      {
        fullName: 'Linh Đan',
        phone: '0901234567',
        password: 'Secret@123',
        gender: 'FEMALE',
        dateOfBirth: '1995-03-08',
        branchID: 'BR001',
      },
      admin,
    );

    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.role).toBe('STAFF');
    expect(data.branchAID).toBe('branch-aid');
    expect(data.createdByAID).toBe('admin-aid');
    expect(data.passwordHash).not.toBe('Secret@123');
    expect(created.role).toBe('STAFF');
    expect(created.branchID).toBe('BR001');

    prisma.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.createStaff(
        {
          fullName: 'Linh Đan',
          phone: '0901234567',
          password: 'Secret@123',
          branchID: 'BR001',
        },
        admin,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('forces manager-created staff into the manager branch', async () => {
    prisma.user.create.mockResolvedValueOnce({
      ...customer,
      role: 'STAFF',
      branchAID: 'branch-aid',
      branch: { branchID: 'BR001' },
    });
    await service.createStaff(
      {
        fullName: 'Linh Đan',
        phone: '0901234567',
        password: 'Secret@123',
        branchID: 'OTHER',
      },
      manager,
    );
    expect(branches.getActiveRecord).not.toHaveBeenCalled();
    expect(prisma.user.create.mock.calls[0][0].data.branchAID).toBe(
      'branch-aid',
    );
    await expect(
      service.createStaff(
        {
          fullName: 'Linh Đan',
          phone: '0901234567',
          password: 'Secret@123',
          role: 'MANAGER',
        },
        manager,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
