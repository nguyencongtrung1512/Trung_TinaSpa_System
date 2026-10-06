import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import {
  APPOINTMENT_STATUSES,
  DATE_PATTERN,
  TIME_PATTERN,
  type AppointmentStatus,
} from '../appointments.constants.js';

// Fields that are NOT NULL in the database reject an explicit `null`.
const DefinedOnly = () =>
  ValidateIf((_object: object, value: unknown) => value !== undefined);

export class UpdateAppointmentDto {
  @Trim()
  @DefinedOnly()
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  branchID?: string;

  @DefinedOnly()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'appointmentDate must be YYYY-MM-DD' })
  appointmentDate?: string;

  @DefinedOnly()
  @IsString()
  @Matches(TIME_PATTERN, { message: 'appointmentTime must be HH:mm' })
  appointmentTime?: string;

  @DefinedOnly()
  @IsIn(APPOINTMENT_STATUSES)
  status?: AppointmentStatus;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  serviceNote?: string | null;
}
