import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  CATALOG_STATUSES,
  SLUG_PATTERN,
  type CatalogStatus,
} from '../service-catalog.constants.js';
import { QueryBoolean, Trim } from '../../common/decorators/transforms.js';

const SLUG_MESSAGE = 'slug must be lowercase letters, digits and single dashes';
const MAX_PRICE = 999_999_999_999;

export class CreateServiceDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVietnamese: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEnglish: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameCambodia?: string | null;

  @Trim()
  @IsString()
  @IsNotEmpty()
  serviceCategoryID: string;

  @Trim()
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(150)
  slug: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionCambodia?: string | null;

  @IsInt()
  @Min(0)
  @Max(MAX_PRICE)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number | null;

  @IsOptional()
  @IsBoolean()
  isBookable?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsIn(CATALOG_STATUSES)
  status?: CatalogStatus;

  @IsOptional()
  @IsString()
  note?: string | null;
}

// Fields that are NOT NULL in the database reject an explicit `null`.
const DefinedOnly = () =>
  ValidateIf((_object: object, value: unknown) => value !== undefined);

export class UpdateServiceDto {
  @Trim()
  @DefinedOnly()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVietnamese?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameCambodia?: string | null;

  @Trim()
  @DefinedOnly()
  @IsString()
  @IsNotEmpty()
  serviceCategoryID?: string;

  @Trim()
  @DefinedOnly()
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(150)
  slug?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescriptionCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionCambodia?: string | null;

  @DefinedOnly()
  @IsInt()
  @Min(0)
  @Max(MAX_PRICE)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number | null;

  @DefinedOnly()
  @IsBoolean()
  isBookable?: boolean;

  @DefinedOnly()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @DefinedOnly()
  @IsIn(CATALOG_STATUSES)
  status?: CatalogStatus;

  @IsOptional()
  @IsString()
  note?: string | null;
}

export class ListServicesQueryDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  bookable?: boolean;
}

export class ManageServicesQueryDto extends ListServicesQueryDto {
  @IsOptional()
  @IsIn(CATALOG_STATUSES)
  status?: CatalogStatus;
}
