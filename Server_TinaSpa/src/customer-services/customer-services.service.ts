import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user.js';
import { RoleName } from '../common/constants/roles.js';
import {
  customersInBranchWhere,
  scopedBranchAID,
} from '../common/scope/branch-scope.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  USER_BRANCH_INCLUDE,
  UsersService,
  type PublicUser,
} from '../users/users.service.js';
import {
  normalizePhone,
  phoneVariants,
} from './customer-services.constants.js';
import { businessNow } from '../appointments/appointments.constants.js';
import type {
  AddCustomerServicesDto,
  ListCustomerServicesQueryDto,
  OverviewRange,
  UpdateCustomerServiceDto,
} from './dto/customer-service.dto.js';

const RECENT_APPOINTMENTS = 5;

const serviceInclude = {
  service: {
    select: {
      serviceID: true,
      slug: true,
      shortDescriptionVietnamese: true,
      shortDescriptionEnglish: true,
      shortDescriptionCambodia: true,
      descriptionVietnamese: true,
      descriptionEnglish: true,
      descriptionCambodia: true,
    },
  },
} satisfies Prisma.CustomerServiceInclude;

type CustomerServiceRecord = Prisma.CustomerServiceGetPayload<{
  include: typeof serviceInclude;
}>;

export type CustomerServiceResponse = {
  customerServiceID: string;
  serviceID: string;
  serviceSlug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  /** The service's current full description, falling back to its short description. */
  descriptionVietnamese: string | null;
  descriptionEnglish: string | null;
  descriptionCambodia: string | null;
  price: number;
  quantity: number;
  usedAt: Date;
  staffNote: string | null;
  createdAt: Date;
};

export type CustomerServiceListResponse = {
  items: CustomerServiceResponse[];
  total: number;
  page: number;
  pageSize: number;
};

export type CustomerLookupResponse = {
  exists: boolean;
  customer: PublicUser | null;
  /** Name from the latest guest booking with this phone, to prefill account creation. */
  suggestedName: string | null;
  recentAppointments: {
    appointmentID: string;
    customerName: string;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
  }[];
};

export type OverviewResponse = {
  range: OverviewRange;
  revenue: number;
  previousRevenue: number;
  /** Revenue per bucket: 24 hours for `today`, one entry per day otherwise. */
  trend: number[];
  serviceCount: number;
  customersServed: number;
  newCustomers: number;
  appointmentCount: number;
  pendingAppointments: number;
  recent: {
    customerServiceID: string;
    customerName: string;
    customerPhone: string;
    nameVietnamese: string;
    nameEnglish: string | null;
    quantity: number;
    price: number;
    usedAt: Date;
    staffNote: string | null;
  }[];
};

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const RANGE_DAYS: Record<OverviewRange, number> = {
  today: 1,
  week: 7,
  month: 30,
};

/** Midnight (Asia/Ho_Chi_Minh) of the current business day as a UTC instant. */
function businessDayStart(): Date {
  return new Date(`${businessNow().date}T00:00:00+07:00`);
}

function toResponse(record: CustomerServiceRecord): CustomerServiceResponse {
  return {
    customerServiceID: record.customerServiceID,
    serviceID: record.service.serviceID,
    serviceSlug: record.service.slug,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    descriptionVietnamese:
      record.service.descriptionVietnamese ??
      record.service.shortDescriptionVietnamese,
    descriptionEnglish:
      record.service.descriptionEnglish ??
      record.service.shortDescriptionEnglish,
    descriptionCambodia:
      record.service.descriptionCambodia ??
      record.service.shortDescriptionCambodia,
    price: record.priceSnapshot.toNumber(),
    quantity: record.quantity,
    usedAt: record.usedAt,
    staffNote: record.staffNote,
    createdAt: record.createdAt,
  };
}

function parseUsedAt(value: string | undefined): Date | undefined {
  if (value === undefined) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() > Date.now()) {
    throw new BadRequestException('usedAt must not be in the future');
  }
  return date;
}

@Injectable()
export class CustomerServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async lookup(
    phone: string,
    actor: AuthUser,
  ): Promise<CustomerLookupResponse> {
    const normalized = normalizePhone(phone);
    const variants = phoneVariants(normalized);
    const scope = scopedBranchAID(actor);

    const [user, appointments] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          phone: { in: variants },
          ...(scope
            ? customersInBranchWhere(scope)
            : { role: RoleName.CUSTOMER }),
        },
        include: USER_BRANCH_INCLUDE,
      }),
      this.prisma.appointment.findMany({
        where: {
          phoneNumber: { in: variants },
          ...(scope ? { branchAID: scope } : {}),
        },
        orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'desc' }],
        take: RECENT_APPOINTMENTS,
      }),
    ]);

    return {
      exists: user !== null,
      customer: user ? this.users.toPublicUser(user) : null,
      suggestedName: appointments[0]?.customerName ?? null,
      recentAppointments: appointments.map((appointment) => ({
        appointmentID: appointment.appointmentID,
        customerName: appointment.customerName,
        appointmentDate: appointment.appointmentDate.toISOString().slice(0, 10),
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
      })),
    };
  }

  createCustomer(
    phone: string,
    fullName: string,
    actor: AuthUser,
  ): Promise<PublicUser> {
    const branchAID = scopedBranchAID(actor);
    return this.users.createCustomerWithDefaultPassword(
      normalizePhone(phone),
      fullName,
      actor.userAID,
      branchAID,
    );
  }

  async listForCustomer(
    userID: string,
    query: ListCustomerServicesQueryDto,
    actor: AuthUser,
  ): Promise<CustomerServiceListResponse> {
    const customer = await this.getCustomer(userID, actor);
    return this.listByCustomerAID(
      customer.userAID,
      query,
      scopedBranchAID(actor),
    );
  }

  async listMine(
    userAID: string,
    query: ListCustomerServicesQueryDto,
  ): Promise<CustomerServiceListResponse> {
    return this.listByCustomerAID(userAID, query);
  }

  async add(
    userID: string,
    dto: AddCustomerServicesDto,
    actor: AuthUser,
  ): Promise<CustomerServiceResponse[]> {
    const customer = await this.getCustomer(userID, actor);
    const usedAt = parseUsedAt(dto.usedAt);
    // ADMIN không thuộc khu vực nào: ghi nhận theo khu vực của khách.
    const branchAID = scopedBranchAID(actor) ?? customer.branchAID;

    const serviceIDs = [...new Set(dto.items.map((item) => item.serviceID))];
    const services = await this.prisma.service.findMany({
      where: {
        serviceID: { in: serviceIDs },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
    const byID = new Map(
      services.map((service) => [service.serviceID, service]),
    );
    const missing = serviceIDs.filter((serviceID) => !byID.has(serviceID));
    if (missing.length > 0) {
      throw new NotFoundException(`Service not found: ${missing.join(', ')}`);
    }

    const records = await this.prisma.$transaction(
      dto.items.map((item) => {
        const service = byID.get(item.serviceID)!;
        return this.prisma.customerService.create({
          data: {
            nameVietnamese: service.nameVietnamese,
            nameEnglish: service.nameEnglish,
            nameCambodia: service.nameCambodia,
            customerAID: customer.userAID,
            serviceAID: service.serviceAID,
            priceSnapshot: service.price,
            quantity: item.quantity ?? 1,
            usedAt,
            staffNote: item.staffNote || null,
            branchAID,
            createdByAID: actor.userAID,
            updatedByAID: actor.userAID,
          },
          include: serviceInclude,
        });
      }),
    );
    return records.map(toResponse);
  }

  async update(
    customerServiceID: string,
    dto: UpdateCustomerServiceDto,
    actor: AuthUser,
  ): Promise<CustomerServiceResponse> {
    await this.getRecord(customerServiceID, actor);
    const record = await this.prisma.customerService.update({
      where: { customerServiceID },
      data: {
        quantity: dto.quantity,
        usedAt: parseUsedAt(dto.usedAt),
        staffNote:
          dto.staffNote === undefined ? undefined : dto.staffNote || null,
        updatedByAID: actor.userAID,
      },
      include: serviceInclude,
    });
    return toResponse(record);
  }

  async remove(customerServiceID: string, actor: AuthUser): Promise<void> {
    await this.getRecord(customerServiceID, actor);
    await this.prisma.customerService.update({
      where: { customerServiceID },
      data: { deletedAt: new Date(), updatedByAID: actor.userAID },
    });
  }

  async overview(
    range: OverviewRange,
    actor: AuthUser,
  ): Promise<OverviewResponse> {
    const days = RANGE_DAYS[range];
    const end = new Date(businessDayStart().getTime() + DAY_MS);
    const start = new Date(end.getTime() - days * DAY_MS);
    const previousStart = new Date(start.getTime() - days * DAY_MS);
    const dateOnly = (instant: Date) =>
      new Date(
        `${new Date(instant.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)}T00:00:00.000Z`,
      );
    const scope = scopedBranchAID(actor);
    const serviceScope = scope ? { branchAID: scope } : {};
    const customerUserScope = scope
      ? customersInBranchWhere(scope)
      : { role: RoleName.CUSTOMER };
    const appointmentScope = scope ? { branchAID: scope } : {};

    const [rows, newCustomers, appointmentCount, pendingAppointments, recent] =
      await Promise.all([
        this.prisma.customerService.findMany({
          where: {
            deletedAt: null,
            usedAt: { gte: previousStart, lt: end },
            ...serviceScope,
          },
          select: {
            customerAID: true,
            priceSnapshot: true,
            quantity: true,
            usedAt: true,
          },
        }),
        this.prisma.user.count({
          where: { createdAt: { gte: start, lt: end }, ...customerUserScope },
        }),
        this.prisma.appointment.count({
          where: {
            status: { not: 'CANCELLED' },
            appointmentDate: { gte: dateOnly(start), lt: dateOnly(end) },
            ...appointmentScope,
          },
        }),
        this.prisma.appointment.count({
          where: { status: 'PENDING', ...appointmentScope },
        }),
        this.prisma.customerService.findMany({
          where: { deletedAt: null, ...serviceScope },
          include: { customer: { select: { fullName: true, phone: true } } },
          orderBy: [{ usedAt: 'desc' }, { customerServiceID: 'desc' }],
          take: 6,
        }),
      ]);

    const buckets = range === 'today' ? 24 : days;
    const trend = new Array<number>(buckets).fill(0);
    let revenue = 0;
    let previousRevenue = 0;
    let serviceCount = 0;
    const served = new Set<string>();
    for (const row of rows) {
      const amount = row.priceSnapshot.toNumber() * row.quantity;
      if (row.usedAt < start) {
        previousRevenue += amount;
        continue;
      }
      revenue += amount;
      serviceCount += 1;
      served.add(row.customerAID);
      const index =
        range === 'today'
          ? new Date(row.usedAt.getTime() + VN_OFFSET_MS).getUTCHours()
          : Math.min(
              buckets - 1,
              Math.floor((row.usedAt.getTime() - start.getTime()) / DAY_MS),
            );
      trend[index] += amount;
    }

    return {
      range,
      revenue,
      previousRevenue,
      trend,
      serviceCount,
      customersServed: served.size,
      newCustomers,
      appointmentCount,
      pendingAppointments,
      recent: recent.map((record) => ({
        customerServiceID: record.customerServiceID,
        customerName: record.customer.fullName,
        customerPhone: record.customer.phone,
        nameVietnamese: record.nameVietnamese,
        nameEnglish: record.nameEnglish,
        quantity: record.quantity,
        price: record.priceSnapshot.toNumber(),
        usedAt: record.usedAt,
        staffNote: record.staffNote,
      })),
    };
  }

  private async listByCustomerAID(
    customerAID: string,
    query: ListCustomerServicesQueryDto,
    branchAID: string | null = null,
  ): Promise<CustomerServiceListResponse> {
    const { page, pageSize } = query;
    const where: Prisma.CustomerServiceWhereInput = {
      customerAID,
      deletedAt: null,
      ...(branchAID ? { branchAID } : {}),
    };
    const [records, total] = await this.prisma.$transaction([
      this.prisma.customerService.findMany({
        where,
        include: serviceInclude,
        orderBy: [{ usedAt: 'desc' }, { customerServiceID: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.customerService.count({ where }),
    ]);
    return { items: records.map(toResponse), total, page, pageSize };
  }

  private async getCustomer(userID: string, actor: AuthUser): Promise<User> {
    const user = await this.users.findByUserID(userID);
    if (!user || user.role !== RoleName.CUSTOMER) {
      throw new NotFoundException('Customer not found');
    }
    const scope = scopedBranchAID(actor);
    if (!scope) return user;
    const visible = await this.prisma.user.findFirst({
      where: { userAID: user.userAID, ...customersInBranchWhere(scope) },
      select: { userAID: true },
    });
    if (!visible) {
      throw new NotFoundException('Customer not found');
    }
    return user;
  }

  private async getRecord(customerServiceID: string, actor: AuthUser) {
    const scope = scopedBranchAID(actor);
    const record = await this.prisma.customerService.findFirst({
      where: {
        customerServiceID,
        deletedAt: null,
        ...(scope ? { branchAID: scope } : {}),
      },
    });
    if (!record) {
      throw new NotFoundException('Customer service not found');
    }
    return record;
  }
}
