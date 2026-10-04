import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';

export const USER_GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
export type UserGender = (typeof USER_GENDERS)[number];

export class CreateStaffDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @Trim()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsIn(USER_GENDERS)
  gender?: UserGender | null;

  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateOfBirth must be YYYY-MM-DD',
  })
  dateOfBirth?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  avatar?: string | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}
