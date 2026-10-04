import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import { USER_GENDERS, type UserGender } from './create-staff.dto.js';

export class UpdateProfileDto {
  @Trim()
  @ValidateIf((_object: object, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

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
}
