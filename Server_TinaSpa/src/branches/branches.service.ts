import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Branch, Prisma } from '@prisma/client';
import {
  OPEN_STATUSES,
  businessNow,
  toDateOnly,
} from '../appointments/appointments.constants.js';
import { RoleName } from '../common/constants/roles.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUniqueViolation } from '../service-catalog/service-catalog.constants.js';
import type { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

export const BranchStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type BranchResponse = {
  branchID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  addressVietnamese: string | null;
  addressEnglish: string | null;
  addressCambodia: string | null;
  hotline: string | null;
  openTime: string;
  closeTime: string;
};

export function toBranchResponse(branch: Branch): BranchResponse {
  return {
    branchID: branch.branchID,
    slug: branch.slug,
    nameVietnamese: branch.nameVietnamese,
    nameEnglish: branch.nameEnglish,
    nameCambodia: branch.nameCambodia,
    addressVietnamese: branch.addressVietnamese,
    addressEnglish: branch.addressEnglish,
    addressCambodia: branch.addressCambodia,
    hotline: branch.hotline,
    openTime: branch.openTime,
    closeTime: branch.closeTime,
  };
}

/** Admin view: every field plus how many accounts and upcoming bookings depend on the branch. */
export type ManagedBranchResponse = BranchResponse & {
  status: string;
  sortOrder: number;
  note: string | null;
  managerCount: number;
  staffCount: number;
  customerCount: number;
  upcomingAppointments: number;
  createdAt: Date;
  updatedAt: Date;
};

const BRANCH_ORDER: Prisma.BranchOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { nameVietnamese: 'asc' },
];

/** Open bookings from today (business time zone) onward. */
function upcomingWhere(): Prisma.AppointmentWhereInput {
  return {
    status: { in: OPEN_STATUSES },
    appointmentDate: { gte: toDateOnly(businessNow().date)! },
  };
}

function assertOpeningHours(openTime: string, closeTime: string): void {
  if (closeTime <= openTime) {
    throw new BadRequestException('closeTime must be after openTime');
  }
}

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<BranchResponse[]> {
    const branches = await this.prisma.branch.findMany({
      where: { status: BranchStatus.ACTIVE, deletedAt: null },
      orderBy: BRANCH_ORDER,
    });
    return branches.map(toBranchResponse);
  }

  async listForManage(): Promise<ManagedBranchResponse[]> {
    const branches = await this.prisma.branch.findMany({
      where: { deletedAt: null },
      orderBy: BRANCH_ORDER,
    });
    const branchAIDs = branches.map((branch) => branch.branchAID);
    const [userGroups, appointmentGroups] = await Promise.all([
      this.prisma.user.groupBy({
        by: ['branchAID', 'role'],
        where: { branchAID: { in: branchAIDs } },
        orderBy: { branchAID: 'asc' },
        _count: { _all: true },
      }),
      this.prisma.appointment.groupBy({
        by: ['branchAID'],
        where: { branchAID: { in: branchAIDs }, ...upcomingWhere() },
        orderBy: { branchAID: 'asc' },
        _count: { _all: true },
      }),
    ]);

    const countOf = (
      group: { _count?: true | { _all?: number } } | undefined,
    ) => (typeof group?._count === 'object' ? (group._count._all ?? 0) : 0);
    const usersOf = (branchAID: string, role: RoleName) =>
      countOf(
        userGroups.find(
          (item) => item.branchAID === branchAID && item.role === role,
        ),
      );

    return branches.map((branch) => ({
      ...toBranchResponse(branch),
      status: branch.status,
      sortOrder: branch.sortOrder,
      note: branch.note,
      managerCount: usersOf(branch.branchAID, RoleName.MANAGER),
      staffCount: usersOf(branch.branchAID, RoleName.STAFF),
      customerCount: usersOf(branch.branchAID, RoleName.CUSTOMER),
      upcomingAppointments: countOf(
        appointmentGroups.find((item) => item.branchAID === branch.branchAID),
      ),
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    }));
  }

  async create(
    dto: CreateBranchDto,
    userAID: string,
  ): Promise<ManagedBranchResponse> {
    assertOpeningHours(dto.openTime ?? '08:00', dto.closeTime ?? '20:00');
    try {
      const branch = await this.prisma.branch.create({
        data: { ...dto, createdByAID: userAID, updatedByAID: userAID },
      });
      return this.findManaged(branch.branchID);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Branch slug already exists');
      }
      throw error;
    }
  }

  async update(
    branchID: string,
    dto: UpdateBranchDto,
    userAID: string,
  ): Promise<ManagedBranchResponse> {
    const current = await this.getByBranchID(branchID);
    assertOpeningHours(
      dto.openTime ?? current.openTime,
      dto.closeTime ?? current.closeTime,
    );
    try {
      await this.prisma.branch.update({
        where: { branchAID: current.branchAID },
        data: { ...dto, updatedByAID: userAID },
      });
      return this.findManaged(branchID);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Branch slug already exists');
      }
      throw error;
    }
  }

  /** Soft delete; refused while staff still work there or bookings are upcoming. */
  async remove(branchID: string, userAID: string): Promise<void> {
    const branch = await this.getByBranchID(branchID);
    const [staff, upcoming] = await Promise.all([
      this.prisma.user.count({
        where: {
          branchAID: branch.branchAID,
          role: { in: [RoleName.MANAGER, RoleName.STAFF] },
        },
      }),
      this.prisma.appointment.count({
        where: { branchAID: branch.branchAID, ...upcomingWhere() },
      }),
    ]);
    if (staff > 0) {
      throw new ConflictException('Branch still has staff');
    }
    if (upcoming > 0) {
      throw new ConflictException('Branch still has upcoming appointments');
    }
    await this.prisma.branch.update({
      where: { branchAID: branch.branchAID },
      data: { deletedAt: new Date(), updatedByAID: userAID },
    });
  }

  private async findManaged(branchID: string): Promise<ManagedBranchResponse> {
    const branch = (await this.listForManage()).find(
      (item) => item.branchID === branchID,
    );
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  /** Resolves a non-deleted branch by its Business ID (includes inactive). */
  async getByBranchID(branchID: string): Promise<Branch> {
    const branch = await this.prisma.branch.findFirst({
      where: { branchID, deletedAt: null },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }

  /** Resolves an active, non-deleted branch by its Business ID. */
  async getActiveRecord(branchID: string): Promise<Branch> {
    const branch = await this.getByBranchID(branchID);
    if (branch.status !== BranchStatus.ACTIVE) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }
}
