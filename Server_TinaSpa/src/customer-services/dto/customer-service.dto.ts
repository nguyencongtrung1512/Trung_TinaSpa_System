import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';

export class CustomerServiceItemDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  serviceID: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity?: number;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  staffNote?: string | null;
}

export class AddCustomerServicesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => CustomerServiceItemDto)
  items: CustomerServiceItemDto[];

  /** ISO date or date-time; defaults to now. */
  @IsOptional()
  @IsISO8601()
  usedAt?: string;
}

export class UpdateCustomerServiceDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity?: number;

  @IsOptional()
  @IsISO8601()
  usedAt?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  staffNote?: string | null;
}

export class ListCustomerServicesQueryDto {
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

export const OVERVIEW_RANGES = ['today', 'week', 'month'] as const;
export type OverviewRange = (typeof OVERVIEW_RANGES)[number];

export class OverviewQueryDto {
  @IsOptional()
  @IsIn(OVERVIEW_RANGES)
  range: OverviewRange = 'today';
}
