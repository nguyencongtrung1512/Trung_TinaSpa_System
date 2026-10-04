import {
  IsBoolean,
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
import {
  CATALOG_STATUSES,
  SLUG_PATTERN,
  type CatalogStatus,
} from '../service-catalog.constants.js';
import { QueryBoolean, Trim } from '../../common/decorators/transforms.js';

const SLUG_MESSAGE = 'slug must be lowercase letters, digits and single dashes';

export class CreateServiceCategoryDto {
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
  descriptionVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  image?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageAlt?: string | null;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

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

export class UpdateServiceCategoryDto {
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
  descriptionVietnamese?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  descriptionCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  image?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageAlt?: string | null;

  @DefinedOnly()
  @IsBoolean()
  isFeatured?: boolean;

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

export class ListServiceCategoriesQueryDto {
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  bookable?: boolean;

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  includeServices?: boolean;
}

export class ManageServiceCategoriesQueryDto {
  @IsOptional()
  @IsIn(CATALOG_STATUSES)
  status?: CatalogStatus;
}
