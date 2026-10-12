import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import { SAFE_URL_PATTERN, stripHtml } from '../../common/utils/html-sanitizer.util.js';
import { SLUG_PATTERN } from '../../service-catalog/service-catalog.constants.js';
import {
  MAX_PRODUCT_DETAILS,
  MAX_PRODUCT_VARIANTS,
  MAX_VARIANT_IMAGES,
  PRODUCT_DETAIL_TYPES,
  PRODUCT_SORTS,
  PRODUCT_STATUSES,
  type ProductStatus,
} from '../products.constants.js';

const PlainText = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? stripHtml(value) : value));

const MAX_PRICE = 999_999_999_999;

export class ProductDetailDto {
  @IsIn(PRODUCT_DETAIL_TYPES)
  detailType!: string;

  @PlainText()
  @IsString()
  @MaxLength(255)
  nameVietnamese!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameCambodia?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentVietnamese?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  contentCambodia?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_URL_PATTERN, { message: 'image must be a safe URL' })
  image?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageAlt?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;
}

export class ProductVariantImageDto {
  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_URL_PATTERN, { message: 'image must be a safe URL' })
  image!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altVietnamese?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  altEnglish?: string | null;
}

export class ProductVariantDto {
  /** Present when updating an existing variant; omitted for a new one. */
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(14)
  productVariantID?: string;

  @PlainText()
  @IsString()
  @MaxLength(255)
  nameVietnamese!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameCambodia?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string | null;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(MAX_PRICE)
  price!: number;

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  @Max(MAX_PRICE)
  compareAtPrice?: number | null;

  /** Ordered gallery; the first image is the cover. Omit to leave the stored images untouched. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_VARIANT_IMAGES)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantImageDto)
  images?: ProductVariantImageDto[];

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;
}

/**
 * Create + update payload. Every field is optional here; `ProductsService.create` enforces the required ones.
 * `details`, when present, replaces the whole detail list of the product.
 * `variants`, when present, is the full variant list: listed IDs are updated, new ones created, missing ones removed.
 */
export class SaveProductDto {
  @PlainText()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameVietnamese?: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameCambodia?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase letters, digits and hyphens' })
  slug?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(14)
  productCategoryID?: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitleVietnamese?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitleEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitleCambodia?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionVietnamese?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionCambodia?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_URL_PATTERN, { message: 'image must be a safe URL' })
  image?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageAlt?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badge?: string | null;

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PRODUCT_VARIANTS)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PRODUCT_DETAILS)
  @ValidateNested({ each: true })
  @Type(() => ProductDetailDto)
  details?: ProductDetailDto[];
}

export class ListProductsQueryDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(14)
  categoryID?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(PRODUCT_SORTS)
  sort?: (typeof PRODUCT_SORTS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize: number = 12;
}

export class ManageProductsQueryDto extends ListProductsQueryDto {
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;
}
