import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BranchesService } from './branches.service.js';

describe('BranchesService', () => {
  let service: BranchesService;
  let prisma: {
    branch: Record<
      'findMany' | 'findFirst' | 'create' | 'update',
      ReturnType<typeof vi.fn>
    >;
    user: Record<'groupBy' | 'count', ReturnType<typeof vi.fn>>;
    appointment: Record<'groupBy' | 'count', ReturnType<typeof vi.fn>>;
  };

  const now = new Date();
  const branch = {
    branchAID: 'br-aid',
    branchID: 'BR001',
    slug: 'ben-nghe',
    nameVietnamese: 'TinaSpa Bến Nghé',
    nameEnglish: null,
    nameCambodia: null,
    addressVietnamese: 'Quận 1',
    addressEnglish: null,
    addressCambodia: null,
    hotline: null,
    openTime: '08:00',
    closeTime: '20:00',
    sortOrder: 0,
    status: 'ACTIVE',
    createdAt: now,
    createdByAID: null,
    updatedAt: now,
    updatedByAID: null,
    deletedAt: null,
    note: null,
  };

  beforeEach(async () => {
    prisma = {
      branch: {
        findMany: vi.fn().mockResolvedValue([branch]),
        findFirst: vi.fn().mockResolvedValue(branch),
        create: vi.fn().mockResolvedValue(branch),
        update: vi.fn().mockResolvedValue(branch),
      },
      user: {
        groupBy: vi.fn().mockResolvedValue([
          { branchAID: 'br-aid', role: 'STAFF', _count: { _all: 3 } },
          { branchAID: 'br-aid', role: 'CUSTOMER', _count: { _all: 12 } },
        ]),
        count: vi.fn().mockResolvedValue(0),
      },
      appointment: {
        groupBy: vi
          .fn()
          .mockResolvedValue([{ branchAID: 'br-aid', _count: { _all: 4 } }]),
        count: vi.fn().mockResolvedValue(0),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(BranchesService);
  });

  it('lists every branch with staff, customer and upcoming booking counts', async () => {
    const [result] = await service.listForManage();

    expect(prisma.branch.findMany.mock.calls[0][0].where).toEqual({
      deletedAt: null,
    });
    expect(result).toMatchObject({
      branchID: 'BR001',
      status: 'ACTIVE',
      managerCount: 0,
      staffCount: 3,
      customerCount: 12,
      upcomingAppointments: 4,
    });
    expect(result).not.toHaveProperty('branchAID');
  });

  it('rejects closing time before opening time', async () => {
    await expect(
      service.create(
        {
          nameVietnamese: 'X',
          slug: 'x',
          openTime: '20:00',
          closeTime: '08:00',
        },
        'admin',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.update('BR001', { closeTime: '07:00' }, 'admin'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps a duplicate slug to a conflict', async () => {
    prisma.branch.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.create({ nameVietnamese: 'X', slug: 'ben-nghe' }, 'admin'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses to delete a branch that still has staff or upcoming bookings', async () => {
    prisma.user.count.mockResolvedValueOnce(2);
    await expect(service.remove('BR001', 'admin')).rejects.toThrow(
      'Branch still has staff',
    );

    prisma.appointment.count.mockResolvedValueOnce(1);
    await expect(service.remove('BR001', 'admin')).rejects.toThrow(
      'Branch still has upcoming appointments',
    );

    await service.remove('BR001', 'admin');
    expect(prisma.branch.update.mock.calls[0][0].data.deletedAt).toBeInstanceOf(
      Date,
    );
  });
});
