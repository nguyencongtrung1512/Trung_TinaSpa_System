import {
  IsBoolean,
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
import { USER_GENDERS, type UserGender } from './create-staff.dto.js';

/** Sửa tài khoản nội bộ. Trường bỏ trống (undefined) giữ nguyên giá trị cũ. */
export class UpdateStaffDto {
  @Trim()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, {
    message: 'phone must be a valid phone number',
  })
  phone?: string;

  /** Đặt lại mật khẩu; bỏ trống để giữ mật khẩu cũ. */
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

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

  /** Chuyển khu vực: chỉ ADMIN. */
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(14)
  branchID?: string;

  @IsOptional()
  @IsString()
  note?: string | null;
}

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive: boolean;
}
