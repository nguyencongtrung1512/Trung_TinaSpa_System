import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  APPOINTMENT_STATUSES,
  DATE_PATTERN,
  type AppointmentStatus,
} from '../appointments.constants.js';

export class ListAppointmentsQueryDto {
  /** Optional specific date filter (YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'date must be YYYY-MM-DD' })
  date?: string;

  /** Optional lower bound for appointmentDate (YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'fromDate must be YYYY-MM-DD' })
  fromDate?: string;

  /** Optional upper bound for appointmentDate (YYYY-MM-DD). */
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'toDate must be YYYY-MM-DD' })
  toDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(14)
  branchID?: string;

  @IsOptional()
  @IsIn(APPOINTMENT_STATUSES)
  status?: AppointmentStatus;
}
