import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Appointment, Branch, Prisma, User } from '@prisma/client';
import {
  BranchesService,
  toBranchResponse,
  type BranchResponse,
} from '../branches/branches.service.js';
import { RoleName } from '../common/constants/roles.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AppointmentStatus,
  OPEN_STATUSES,
  businessNow,
  formatDateOnly,
  toDateOnly,
} from './appointments.constants.js';
import type { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import type { ListAppointmentsQueryDto } from './dto/list-appointments.dto.js';
import type { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

const STAFF_SELECT = { select: { userID: true, fullName: true } } as const;

const APPOINTMENT_INCLUDE = {
  branch: true,
  confirmedBy: STAFF_SELECT,
  servedBy: STAFF_SELECT,
} satisfies Prisma.AppointmentInclude;

type StaffSummary = Pick<User, 'userID' | 'fullName'>;

type AppointmentRecord = Appointment & {
  branch: Branch;
  confirmedBy: StaffSummary | null;
  servedBy: StaffSummary | null;
};

type StageField =
  'confirmedAt' | 'checkedInAt' | 'serviceStartedAt' | 'completedAt';

/** Service flow in order; reaching a stage stamps it and every earlier stage that was skipped. */
const SERVICE_STAGES: {
  status: AppointmentStatus;
  at: StageField;
  by?: 'confirmedByAID' | 'servedByAID';
}[] = [
  {
    status: AppointmentStatus.CONFIRMED,
    at: 'confirmedAt',
    by: 'confirmedByAID',
  },
];

export type AppointmentResponse = {
  appointmentID: string;
  customerName: string;
  phoneNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  customerNote: string | null;
  status: string;
  branch: BranchResponse;
  confirmedAt: Date | null;
  confirmedBy: StaffSummary | null;
  checkedInAt: Date | null;
  serviceStartedAt: Date | null;
  completedAt: Date | null;
  servedBy: StaffSummary | null;
  serviceNote: string | null;
  /** Completed visits with the same phone number. */
  completedVisits: number;
  createdAt: Date;
  updatedAt: Date;
  note: string | null;
};

/** What the public booking form gets back; no internal fields. */
export type BookingReceipt = Pick<
  AppointmentResponse,
  | 'appointmentID'
  | 'customerName'
  | 'appointmentDate'
  | 'appointmentTime'
  | 'status'
  | 'branch'
>;

function toAppointmentResponse(
  record: AppointmentRecord,
  completedVisits = 0,
): AppointmentResponse {
  return {
    appointmentID: record.appointmentID,
    customerName: record.customerName,
    phoneNumber: record.phoneNumber,
    appointmentDate: formatDateOnly(record.appointmentDate),
    appointmentTime: record.appointmentTime,
    customerNote: record.customerNote,
    status: record.status,
    branch: toBranchResponse(record.branch),
    confirmedAt: record.confirmedAt,
    confirmedBy: record.confirmedBy,
    checkedInAt: record.checkedInAt,
    serviceStartedAt: record.serviceStartedAt,
    completedAt: record.completedAt,
    servedBy: record.servedBy,
    serviceNote: record.serviceNote,
    completedVisits,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    note: record.note,
  };
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branches: BranchesService,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<BookingReceipt> {
    const branch = await this.branches.getActiveRecord(dto.branchID);
    const appointmentDate = this.parseDate(dto.appointmentDate);
    this.assertBookable(branch, dto.appointmentDate, dto.appointmentTime);

    const duplicate = await this.prisma.appointment.findFirst({
      where: {
        phoneNumber: dto.phoneNumber,
        appointmentDate,
        status: { in: OPEN_STATUSES },
      },
    });
    if (duplicate) {
      throw new ConflictException('Appointment already exists on this date');
    }

    const customer = await this.prisma.user.findFirst({
      where: { phone: dto.phoneNumber, role: RoleName.CUSTOMER },
      select: { userAID: true },
    });

    const record = await this.prisma.appointment.create({
      data: {
        nameVietnamese: `Lịch hẹn ${dto.customerName}`,
        nameEnglish: `Appointment ${dto.customerName}`,
        customerName: dto.customerName,
        phoneNumber: dto.phoneNumber,
        customerAID: customer?.userAID ?? null,
        branchAID: branch.branchAID,
        appointmentDate,
        appointmentTime: dto.appointmentTime,
        customerNote: dto.customerNote || null,
      },
      include: APPOINTMENT_INCLUDE,
    });

    const { appointmentID, customerName, appointmentTime, status } = record;
    return {
      appointmentID,
      customerName,
      appointmentDate: dto.appointmentDate,
      appointmentTime,
      status,
      branch: toBranchResponse(record.branch),
    };
  }

  async list(query: ListAppointmentsQueryDto): Promise<AppointmentResponse[]> {
    const where: Prisma.AppointmentWhereInput = {
      ...(query.branchID ? { branch: { branchID: query.branchID } } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    if (query.date) {
      where.appointmentDate = this.parseDate(query.date);
    } else if (query.fromDate || query.toDate) {
      where.appointmentDate = {
        ...(query.fromDate ? { gte: this.parseDate(query.fromDate) } : {}),
        ...(query.toDate ? { lte: this.parseDate(query.toDate) } : {}),
      };
    }

    const records = await this.prisma.appointment.findMany({
      where,
      include: APPOINTMENT_INCLUDE,
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    const visits = await this.completedVisits(
      records.map((record) => record.phoneNumber),
    );
    return records.map((record) =>
      toAppointmentResponse(record, visits.get(record.phoneNumber)),
    );
  }

  async findOne(appointmentID: string): Promise<AppointmentResponse> {
    return this.respond(await this.getRecord(appointmentID));
  }

  async update(
    appointmentID: string,
    dto: UpdateAppointmentDto,
    userAID: string,
  ): Promise<AppointmentResponse> {
    const current = await this.getRecord(appointmentID);
    const branch =
      dto.branchID && dto.branchID !== current.branch.branchID
        ? await this.branches.getActiveRecord(dto.branchID)
        : current.branch;
    const date = dto.appointmentDate ?? formatDateOnly(current.appointmentDate);
    const time = dto.appointmentTime ?? current.appointmentTime;

    const rescheduled =
      branch.branchAID !== current.branchAID ||
      date !== formatDateOnly(current.appointmentDate) ||
      time !== current.appointmentTime;
    if (rescheduled) {
      if (current.checkedInAt) {
        throw new ConflictException('Customer has already checked in');
      }
      this.parseDate(date);
      this.assertBookable(branch, date, time);
    }

    const status = dto.status ?? current.status;
    const record = await this.prisma.appointment.update({
      where: { appointmentAID: current.appointmentAID },
      data: {
        branchAID: branch.branchAID,
        appointmentDate: this.parseDate(date),
        appointmentTime: time,
        status,
        ...(status === current.status
          ? {}
          : this.stageStamps(current, status, userAID)),
        ...(dto.note === undefined ? {} : { note: dto.note || null }),
        ...(dto.serviceNote === undefined
          ? {}
          : { serviceNote: dto.serviceNote || null }),
        updatedByAID: userAID,
      },
      include: APPOINTMENT_INCLUDE,
    });
    return this.respond(record);
  }

  async confirm(
    appointmentID: string,
    userAID: string,
  ): Promise<AppointmentResponse> {
    const current = await this.getRecord(appointmentID);
    if (current.status !== AppointmentStatus.PENDING) {
      throw new ConflictException('Only pending appointments can be confirmed');
    }
    const record = await this.prisma.appointment.update({
      where: { appointmentAID: current.appointmentAID },
      data: {
        status: AppointmentStatus.CONFIRMED,
        confirmedAt: new Date(),
        confirmedByAID: userAID,
        updatedByAID: userAID,
      },
      include: APPOINTMENT_INCLUDE,
    });
    return this.respond(record);
  }

  /**
   * Moving forward stamps the reached stage (and any skipped earlier stage);
   * moving back clears the stages after the new status. Cancelling keeps history.
   */
  private stageStamps(
    current: Appointment,
    status: string,
    userAID: string,
  ): Prisma.AppointmentUncheckedUpdateInput {
    if (status === AppointmentStatus.CANCELLED) return {};
    const reached = SERVICE_STAGES.findIndex(
      (stage) => stage.status === status,
    );
    const now = new Date();
    const data: Prisma.AppointmentUncheckedUpdateInput = {};
    SERVICE_STAGES.forEach((stage, index) => {
      if (index <= reached) {
        if (current[stage.at]) return;
        data[stage.at] = now;
        if (stage.by) data[stage.by] = userAID;
      } else {
        data[stage.at] = null;
        if (stage.by) data[stage.by] = null;
      }
    });
    return data;
  }

  private async completedVisits(phoneNumbers: string[]) {
    if (phoneNumbers.length === 0) return new Map<string, number>();
    const groups = await this.prisma.appointment.groupBy({
      by: ['phoneNumber'],
      where: {
        phoneNumber: { in: [...new Set(phoneNumbers)] },
        status: AppointmentStatus.COMPLETED,
      },
      _count: { _all: true },
    });
    return new Map(
      groups.map((group) => [group.phoneNumber, group._count._all]),
    );
  }

  private async respond(record: AppointmentRecord) {
    const visits = await this.completedVisits([record.phoneNumber]);
    return toAppointmentResponse(record, visits.get(record.phoneNumber));
  }

  private async getRecord(appointmentID: string): Promise<AppointmentRecord> {
    const record = await this.prisma.appointment.findUnique({
      where: { appointmentID },
      include: APPOINTMENT_INCLUDE,
    });
    if (!record) {
      throw new NotFoundException('Appointment not found');
    }
    return record;
  }

  private parseDate(value: string): Date {
    const date = toDateOnly(value);
    if (!date) {
      throw new BadRequestException('appointmentDate is not a valid date');
    }
    return date;
  }

  /** The slot must be in the future and within the branch's opening hours. */
  private assertBookable(branch: Branch, date: string, time: string): void {
    const now = businessNow();
    if (date < now.date || (date === now.date && time <= now.time)) {
      throw new BadRequestException('Appointment time has passed');
    }
    if (time < branch.openTime || time >= branch.closeTime) {
      throw new BadRequestException(
        'Appointment time is outside opening hours',
      );
    }
  }
}
