import { Injectable, NotFoundException } from '@nestjs/common';
import type { Branch } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

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

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<BranchResponse[]> {
    const branches = await this.prisma.branch.findMany({
      where: { status: BranchStatus.ACTIVE, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { nameVietnamese: 'asc' }],
    });
    return branches.map(toBranchResponse);
  }

  /** Resolves an active, non-deleted branch by its Business ID. */
  async getActiveRecord(branchID: string): Promise<Branch> {
    const branch = await this.prisma.branch.findFirst({
      where: { branchID, status: BranchStatus.ACTIVE, deletedAt: null },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }
    return branch;
  }
}
