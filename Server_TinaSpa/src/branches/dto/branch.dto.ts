import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import {
  CATALOG_STATUSES,
  SLUG_PATTERN,
  type CatalogStatus,
} from '../../service-catalog/service-catalog.constants.js';

const SLUG_MESSAGE = 'slug must be lowercase letters, digits and single dashes';
const TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const TIME_MESSAGE = 'time must be HH:mm';

export class CreateBranchDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVietnamese: string;

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
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(50)
  slug: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hotline?: string | null;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: TIME_MESSAGE })
  openTime?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: TIME_MESSAGE })
  closeTime?: string;

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

export class UpdateBranchDto {
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
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(50)
  slug?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hotline?: string | null;

  @DefinedOnly()
  @Matches(TIME_PATTERN, { message: TIME_MESSAGE })
  openTime?: string;

  @DefinedOnly()
  @Matches(TIME_PATTERN, { message: TIME_MESSAGE })
  closeTime?: string;

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
