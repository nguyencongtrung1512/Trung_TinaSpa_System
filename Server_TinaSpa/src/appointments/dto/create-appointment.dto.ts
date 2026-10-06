import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import {
  DATE_PATTERN,
  PHONE_PATTERN,
  TIME_PATTERN,
} from '../appointments.constants.js';

export class CreateAppointmentDto {
  @Trim()
  @IsString()
  @Length(2, 100)
  customerName: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replaceAll(/\s/g, '') : value,
  )
  @IsString()
  @Matches(PHONE_PATTERN, {
    message: 'phoneNumber is not a valid phone number',
  })
  phoneNumber: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  branchID: string;

  @IsString()
  @Matches(DATE_PATTERN, { message: 'appointmentDate must be YYYY-MM-DD' })
  appointmentDate: string;

  @IsString()
  @Matches(TIME_PATTERN, { message: 'appointmentTime must be HH:mm' })
  appointmentTime: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  customerNote?: string | null;
}
