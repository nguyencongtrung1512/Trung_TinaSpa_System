import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { normalizePhone, phoneVariants } from './customer-services.constants.js';
import { CustomerServicesService } from './customer-services.service.js';

describe('phone helpers', () => {
  it('normalizes +84 and separators to the leading 0', () => {
    expect(normalizePhone('+84 901.234-567')).toBe('0901234567');
    expect(normalizePhone('84901234567')).toBe('0901234567');
    expect(normalizePhone('0901234567')).toBe('0901234567');
    expect(phoneVariants('0901234567')).toEqual(['0901234567', '+84901234567']);
  });
});

describe('CustomerServicesService', () => {
  let service: CustomerServicesService;
  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
    user: { findFirst: ReturnType<typeof vi.fn> };
    appointment: { findMany: ReturnType<typeof vi.fn> };
    service: { findMany: ReturnType<typeof vi.fn> };
    customerService: Record<
      'create' | 'findMany' | 'count' | 'findFirst' | 'update',
      ReturnType<typeof vi.fn>
    >;
  };
  let users: {
    findByUserID: ReturnType<typeof vi.fn>;
    toPublicUser: ReturnType<typeof vi.fn>;
    createCustomerWithDefaultPassword: ReturnType<typeof vi.fn>;
  };

  const customer = { userAID: 'cust-aid', userID: 'cust-id', role: 'CUSTOMER' };
  const admin: AuthUser = {
    userAID: 'actor-aid',
    userID: 'actor-id',
    phone: '0900000000',
    fullName: 'Admin',
    isActive: true,
    roles: ['ADMIN'],
    branchAID: null,
    branchID: null,
  };
  const catalogService = {
    serviceAID: 'svc-aid',
    serviceID: 'svc-id',
    nameVietnamese: 'Massage',
    nameEnglish: 'Massage',
    nameCambodia: null,
    price: new Prisma.Decimal(350000),
  };
  const record = {
    customerServiceID: 'cs-id',
    nameVietnamese: 'Massage',
    nameEnglish: 'Massage',
    nameCambodia: null,
    priceSnapshot: new Prisma.Decimal(350000),
    quantity: 2,
    usedAt: new Date('2026-10-01T03:00:00.000Z'),
    staffNote: null,
    createdAt: new Date('2026-10-01T03:00:00.000Z'),
    service: { serviceID: 'svc-id', slug: 'massage' },
  };

  beforeEach(async () => {
    prisma = {
      $transaction: vi.fn((queries: Promise<unknown>[]) =>
        Promise.all(queries),
      ),
      user: { findFirst: vi.fn().mockResolvedValue(null) },
      appointment: { findMany: vi.fn().mockResolvedValue([]) },
      service: { findMany: vi.fn().mockResolvedValue([catalogService]) },
      customerService: {
        create: vi.fn().mockResolvedValue(record),
        findMany: vi.fn().mockResolvedValue([record]),
        count: vi.fn().mockResolvedValue(1),
        findFirst: vi.fn().mockResolvedValue(record),
        update: vi.fn().mockResolvedValue(record),
      },
    };
    users = {
      findByUserID: vi.fn().mockResolvedValue(customer),
      toPublicUser: vi.fn((user: unknown) => user),
      createCustomerWithDefaultPassword: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerServicesService,
        { provide: PrismaService, useValue: prisma },
        { provide: UsersService, useValue: users },
      ],
    }).compile();
    service = module.get(CustomerServicesService);
  });

  it('looks up both phone spellings and suggests the booking name', async () => {
    prisma.appointment.findMany.mockResolvedValueOnce([
      {
        appointmentID: 'ap-1',
        customerName: 'Lan',
        appointmentDate: new Date('2026-10-02T00:00:00.000Z'),
        appointmentTime: '09:30',
        status: 'CONFIRMED',
      },
    ]);

    const result = await service.lookup('+84901234567', admin);

    expect(prisma.user.findFirst.mock.calls[0][0].where.phone).toEqual({
      in: ['0901234567', '+84901234567'],
    });
    expect(result.exists).toBe(false);
    expect(result.suggestedName).toBe('Lan');
    expect(result.recentAppointments[0].appointmentDate).toBe('2026-10-02');
  });

  it('creates the account with the normalized phone', async () => {
    await service.createCustomer('+84901234567', 'Lan', admin);
    expect(users.createCustomerWithDefaultPassword).toHaveBeenCalledWith(
      '0901234567',
      'Lan',
      'actor-aid',
      null,
    );
  });

  it('snapshots name and price when adding services', async () => {
    const result = await service.add(
      'cust-id',
      { items: [{ serviceID: 'svc-id', quantity: 2, staffNote: 'ok' }] },
      admin,
    );

    const data = prisma.customerService.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      customerAID: 'cust-aid',
      serviceAID: 'svc-aid',
      nameVietnamese: 'Massage',
      quantity: 2,
      staffNote: 'ok',
      createdByAID: 'actor-aid',
    });
    expect(data.priceSnapshot).toEqual(new Prisma.Decimal(350000));
    expect(result[0]).toMatchObject({ price: 350000, serviceID: 'svc-id' });
    expect(result[0]).not.toHaveProperty('customerServiceAID');
  });

  it('rejects unknown services, non-customers and future dates', async () => {
    prisma.service.findMany.mockResolvedValueOnce([]);
    await expect(
      service.add('cust-id', { items: [{ serviceID: 'nope' }] }, admin),
    ).rejects.toBeInstanceOf(NotFoundException);

    users.findByUserID.mockResolvedValueOnce({ ...customer, role: 'STAFF' });
    await expect(
      service.add('cust-id', { items: [{ serviceID: 'svc-id' }] }, admin),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service.add(
        'cust-id',
        { items: [{ serviceID: 'svc-id' }], usedAt: '2999-01-01' },
        admin,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists only the caller own non-deleted records', async () => {
    const result = await service.listMine('cust-aid', { page: 2, pageSize: 5 });

    const args = prisma.customerService.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ customerAID: 'cust-aid', deletedAt: null });
    expect(args.skip).toBe(5);
    expect(result.total).toBe(1);
  });

  it('scopes recorded services to the staff branch', async () => {
    const staff: AuthUser = {
      ...admin,
      roles: ['STAFF'],
      branchAID: 'br-a',
      branchID: 'BR-A',
    };
    prisma.user.findFirst.mockResolvedValueOnce({ userAID: 'cust-aid' });

    await service.add('cust-id', { items: [{ serviceID: 'svc-id' }] }, staff);
    expect(prisma.customerService.create.mock.calls[0][0].data.branchAID).toBe(
      'br-a',
    );

    prisma.user.findFirst.mockResolvedValueOnce({ userAID: 'cust-aid' });
    await service.listForCustomer('cust-id', { page: 1, pageSize: 5 }, staff);
    expect(prisma.customerService.findMany.mock.calls[0][0].where).toEqual({
      customerAID: 'cust-aid',
      deletedAt: null,
      branchAID: 'br-a',
    });

    await service.remove('cs-id', staff);
    expect(
      prisma.customerService.findFirst.mock.calls[0][0].where.branchAID,
    ).toBe('br-a');
  });

  it('records admin entries under the customer branch', async () => {
    users.findByUserID.mockResolvedValueOnce({ ...customer, branchAID: 'br-b' });
    await service.add('cust-id', { items: [{ serviceID: 'svc-id' }] }, admin);
    expect(prisma.customerService.create.mock.calls[0][0].data.branchAID).toBe(
      'br-b',
    );
  });

  it('soft deletes a record', async () => {
    await service.remove('cs-id', admin);
    const { data } = prisma.customerService.update.mock.calls[0][0];
    expect(data.deletedAt).toBeInstanceOf(Date);
    expect(data.updatedByAID).toBe('actor-aid');

    prisma.customerService.findFirst.mockResolvedValueOnce(null);
    await expect(service.remove('gone', admin)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
