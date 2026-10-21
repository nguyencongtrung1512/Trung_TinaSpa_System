import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { TreatmentResult } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SaveTreatmentResultDto } from './dto/treatment-result.dto.js';

export type TreatmentResultResponse = {
  treatmentResultID: string;
  titleVietnamese: string;
  titleEnglish: string | null;
  resultVietnamese: string;
  resultEnglish: string | null;
  summaryVietnamese: string | null;
  summaryEnglish: string | null;
  beforeImage: string;
  afterImage: string;
  sessionCount: number;
  durationWeeks: number;
  displayOrder: number;
  isActive: boolean;
  /** Management reads only. */
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const REQUIRED_FIELDS = [
  'titleVietnamese',
  'resultVietnamese',
  'beforeImage',
  'afterImage',
  'sessionCount',
  'durationWeeks',
] as const satisfies readonly (keyof SaveTreatmentResultDto)[];

const orNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;

function toResponse(
  record: TreatmentResult,
  admin = false,
): TreatmentResultResponse {
  return {
    treatmentResultID: record.treatmentResultID,
    titleVietnamese: record.titleVietnamese,
    titleEnglish: record.titleEnglish,
    resultVietnamese: record.resultVietnamese,
    resultEnglish: record.resultEnglish,
    summaryVietnamese: record.summaryVietnamese,
    summaryEnglish: record.summaryEnglish,
    beforeImage: record.beforeImage,
    afterImage: record.afterImage,
    sessionCount: record.sessionCount,
    durationWeeks: record.durationWeeks,
    displayOrder: record.displayOrder,
    isActive: record.isActive,
    ...(admin
      ? {
          note: record.note,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }
      : {}),
  };
}

function editableFields(dto: SaveTreatmentResultDto) {
  return {
    titleVietnamese: dto.titleVietnamese || undefined,
    titleEnglish: orNull(dto.titleEnglish),
    resultVietnamese: dto.resultVietnamese || undefined,
    resultEnglish: orNull(dto.resultEnglish),
    summaryVietnamese: orNull(dto.summaryVietnamese),
    summaryEnglish: orNull(dto.summaryEnglish),
    beforeImage: dto.beforeImage || undefined,
    afterImage: dto.afterImage || undefined,
    sessionCount: dto.sessionCount,
    durationWeeks: dto.durationWeeks,
    displayOrder: dto.displayOrder,
    isActive: dto.isActive,
    note: orNull(dto.note),
  };
}

const ORDER = [
  { displayOrder: 'asc' as const },
  { treatmentResultID: 'asc' as const },
];

@Injectable()
export class TreatmentResultsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public: visible results for the homepage. */
  async list(): Promise<TreatmentResultResponse[]> {
    const records = await this.prisma.treatmentResult.findMany({
      where: { isActive: true },
      orderBy: ORDER,
    });
    return records.map((record) => toResponse(record));
  }

  async listForManage(): Promise<TreatmentResultResponse[]> {
    const records = await this.prisma.treatmentResult.findMany({
      orderBy: ORDER,
    });
    return records.map((record) => toResponse(record, true));
  }

  async create(
    dto: SaveTreatmentResultDto,
    actorAID: string,
  ): Promise<TreatmentResultResponse> {
    for (const field of REQUIRED_FIELDS) {
      if (!dto[field])
        throw new BadRequestException(`${field} should not be empty`);
    }
    const fields = editableFields(dto);
    const record = await this.prisma.treatmentResult.create({
      data: {
        ...fields,
        titleVietnamese: dto.titleVietnamese!,
        resultVietnamese: dto.resultVietnamese!,
        beforeImage: dto.beforeImage!,
        afterImage: dto.afterImage!,
        sessionCount: dto.sessionCount!,
        durationWeeks: dto.durationWeeks!,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
        createdByAID: actorAID,
        updatedByAID: actorAID,
      },
    });
    return toResponse(record, true);
  }

  async update(
    treatmentResultID: string,
    dto: SaveTreatmentResultDto,
    actorAID: string,
  ): Promise<TreatmentResultResponse> {
    await this.getRecord(treatmentResultID);
    const record = await this.prisma.treatmentResult.update({
      where: { treatmentResultID },
      data: { ...editableFields(dto), updatedByAID: actorAID },
    });
    return toResponse(record, true);
  }

  /** Hard delete: results are standalone marketing content with nothing referencing them. */
  async remove(treatmentResultID: string): Promise<void> {
    await this.getRecord(treatmentResultID);
    await this.prisma.treatmentResult.delete({ where: { treatmentResultID } });
  }

  private async getRecord(treatmentResultID: string) {
    const record = await this.prisma.treatmentResult.findUnique({
      where: { treatmentResultID },
    });
    if (!record) throw new NotFoundException('Treatment result not found');
    return record;
  }
}
