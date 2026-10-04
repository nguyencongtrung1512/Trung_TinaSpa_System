import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
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
    createdAt: now,
    createdByAID: null,
    updatedAt: now,
    updatedByAID: null,
    note: null,
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
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
      ['ADMIN'],
    );

    const args = prisma.user.findMany.mock.calls[0][0];
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.where.role).toBe('CUSTOMER');
    expect(args.where.isActive).toBe(true);
    expect(args.where.OR).toHaveLength(4);
    expect(prisma.user.groupBy.mock.calls[0][0].where.role).toEqual({
      in: ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'],
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
  });

  it('limits managers to customer and staff accounts', async () => {
    const result = await service.list({ page: 1, pageSize: 20 }, ['MANAGER']);

    expect(prisma.user.findMany.mock.calls[0][0].where.role).toEqual({
      in: ['CUSTOMER', 'STAFF'],
    });
    expect(result.roleCounts).toEqual({ CUSTOMER: 12, STAFF: 3 });
    await expect(
      service.list({ role: 'ADMIN', page: 1, pageSize: 20 }, ['MANAGER']),
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
    prisma.user.create.mockResolvedValueOnce({ ...customer, role: 'STAFF' });
    const created = await service.createStaff(
      {
        fullName: 'Linh Đan',
        phone: '0901234567',
        password: 'Secret@123',
        gender: 'FEMALE',
        dateOfBirth: '1995-03-08',
      },
      'actor-aid',
    );

    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data.role).toBe('STAFF');
    expect(data.createdByAID).toBe('actor-aid');
    expect(data.passwordHash).not.toBe('Secret@123');
    expect(created.role).toBe('STAFF');

    prisma.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.createStaff(
        { fullName: 'Linh Đan', phone: '0901234567', password: 'Secret@123' },
        'actor-aid',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
