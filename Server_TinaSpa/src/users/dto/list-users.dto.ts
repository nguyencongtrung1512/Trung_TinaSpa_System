import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RoleName } from '../../common/constants/roles.js';
import { QueryBoolean, Trim } from '../../common/decorators/transforms.js';

export const USER_ROLES = Object.values(RoleName);

export class ListUsersQueryDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: RoleName;

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  isActive?: boolean;

  /** ADMIN lọc theo khu vực; MANAGER luôn bị giới hạn khu vực của mình. */
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(14)
  branchID?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}
