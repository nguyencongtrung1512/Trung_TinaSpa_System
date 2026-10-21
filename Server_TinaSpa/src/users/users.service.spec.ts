import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
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
      | 'findMany'
      | 'count'
      | 'groupBy'
      | 'create'
      | 'update'
      | 'findUnique'
      | 'findFirst'
      | 'delete',
      ReturnType<typeof vi.fn>
    >;
    refreshToken: { updateMany: ReturnType<typeof vi.fn> };
    customerService: { findMany: ReturnType<typeof vi.fn> };
    appointment: Record<'findMany' | 'groupBy', ReturnType<typeof vi.fn>>;
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
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      refreshToken: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      customerService: { findMany: vi.fn().mockResolvedValue([]) },
      appointment: {
        findMany: vi.fn().mockResolvedValue([]),
        groupBy: vi.fn().mockResolvedValue([]),
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
    expect(args.include).toEqual({
      branch: { select: { branchID: true, nameVietnamese: true } },
    });
    expect(prisma.user.groupBy.mock.calls[0][0].where.AND[0]).toEqual({
      role: { in: ['MANAGER', 'STAFF', 'CUSTOMER'] },
    });

    expect(result.roleCounts).toEqual({
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

  describe('managing staff accounts', () => {
    const staff = {
      ...customer,
      userAID: 'staff-aid',
      userID: 'staff-id',
      role: 'STAFF',
      branchAID: 'branch-aid',
      branch: { branchID: 'BR001' },
    };

    it('lets a manager edit staff of their branch without moving them', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(staff);
      await service.updateStaff('staff-id', { fullName: 'Linh Đan' }, manager);

      const { data } = prisma.user.update.mock.calls[0][0];
      expect(data).toMatchObject({
        fullName: 'Linh Đan',
        updatedByAID: 'mgr-aid',
      });
      expect(data.branchAID).toBeUndefined();
      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();

      prisma.user.findUnique.mockResolvedValueOnce(staff);
      await expect(
        service.updateStaff('staff-id', { branchID: 'BR002' }, manager),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('hides staff of other branches and managers from a manager', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        ...staff,
        branchAID: 'other',
      });
      await expect(
        service.setActive('staff-id', false, manager),
      ).rejects.toBeInstanceOf(NotFoundException);

      prisma.user.findUnique.mockResolvedValueOnce({
        ...staff,
        role: 'MANAGER',
      });
      await expect(
        service.updateStaff('staff-id', { fullName: 'X' }, manager),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets admin move staff to another branch and signs them out', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(staff);
      branches.getActiveRecord.mockResolvedValueOnce({
        branchAID: 'branch-2',
        branchID: 'BR002',
      });
      await service.updateStaff('staff-id', { branchID: 'BR002' }, admin);

      expect(prisma.user.update.mock.calls[0][0].data.branchAID).toBe(
        'branch-2',
      );
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userAID: 'staff-aid', revokedAt: null },
        }),
      );
    });

    it('locks a branch customer and revokes their sessions', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(customer);
      prisma.user.findFirst.mockResolvedValueOnce({
        userAID: customer.userAID,
      });
      await service.setActive(customer.userID, false, manager);

      expect(prisma.user.update.mock.calls[0][0].data.isActive).toBe(false);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it('refuses to lock yourself or another admin', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        ...staff,
        userAID: 'admin-aid',
        role: 'ADMIN',
      });
      await expect(
        service.setActive('admin-id', false, admin),
      ).rejects.toBeInstanceOf(ForbiddenException);

      prisma.user.findUnique.mockResolvedValueOnce({ ...staff, role: 'ADMIN' });
      await expect(
        service.setActive('staff-id', false, admin),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('deletes an unused account but refuses one with history', async () => {
      const unused = {
        _count: {
          appointments: 0,
          confirmedAppointments: 0,
          servedAppointments: 0,
          customerServices: 0,
          authoredBlogs: 0,
        },
      };
      prisma.user.findUnique
        .mockResolvedValueOnce(staff)
        .mockResolvedValueOnce(unused);
      await service.remove('staff-id', manager);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { userAID: 'staff-aid' },
      });

      prisma.user.findUnique
        .mockResolvedValueOnce(staff)
        .mockResolvedValueOnce({
          _count: { ...unused._count, servedAppointments: 2 },
        });
      await expect(service.remove('staff-id', manager)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.user.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('account detail', () => {
    it('scopes a customer detail to the manager branch and sums services', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(customer);
      prisma.user.findFirst.mockResolvedValueOnce({
        userAID: customer.userAID,
      });
      prisma.customerService.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            priceSnapshot: new Prisma.Decimal(300000),
            quantity: 2,
            usedAt: new Date('2026-10-01T03:00:00.000Z'),
          },
        ]);
      prisma.appointment.groupBy.mockResolvedValueOnce([
        { status: 'COMPLETED', _count: { _all: 3 } },
        { status: 'CANCELLED', _count: { _all: 1 } },
      ]);

      const result = await service.getDetail(customer.userID, manager);

      const serviceWhere =
        prisma.customerService.findMany.mock.calls[0][0].where;
      expect(serviceWhere).toEqual({
        deletedAt: null,
        customerAID: customer.userAID,
        branchAID: 'branch-aid',
      });
      const appointmentWhere =
        prisma.appointment.findMany.mock.calls[0][0].where;
      expect(appointmentWhere.branchAID).toBe('branch-aid');
      expect(appointmentWhere.OR).toContainEqual({
        customerAID: customer.userAID,
      });
      expect(result.stats).toMatchObject({
        serviceCount: 2,
        serviceTotal: 600000,
        appointmentCount: 4,
        completedAppointments: 3,
        cancelledAppointments: 1,
      });
    });

    it('lists services a staff member recorded and bookings they handled', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        ...customer,
        userAID: 'staff-aid',
        userID: 'staff-id',
        role: 'STAFF',
        branchAID: 'branch-aid',
      });

      await service.getDetail('staff-id', manager);

      expect(
        prisma.customerService.findMany.mock.calls[0][0].where,
      ).toMatchObject({
        createdByAID: 'staff-aid',
      });
      expect(prisma.appointment.findMany.mock.calls[0][0].where.OR).toEqual([
        { confirmedByAID: 'staff-aid' },
        { servedByAID: 'staff-aid' },
      ]);
    });
  });
});
