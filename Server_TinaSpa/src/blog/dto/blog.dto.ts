import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { SLUG_PATTERN } from '../../service-catalog/service-catalog.constants.js';
import { QueryBoolean, Trim } from '../../common/decorators/transforms.js';
import { SAFE_URL_PATTERN, stripHtml } from '../../common/utils/html-sanitizer.util.js';
import { BLOG_CONTENT_MAX_LENGTH, BLOG_STATUSES, type BlogStatus } from '../blog.constants.js';

/** Plain-text field: tags are stripped so titles / SEO text can never carry markup. */
const PlainText = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? stripHtml(value) : value));

/**
 * Create + update payload. Every field is optional here; `BlogService.create` enforces the required ones.
 * Optional text columns accept `null` to clear them.
 */
export class SaveBlogDto {
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
  @MaxLength(14)
  blogCategoryID?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase letters, digits and hyphens' })
  slug?: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string | null;

  /** HTML from the editor; sanitized by `sanitizeBlogHtml` before it is stored. */
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(BLOG_CONTENT_MAX_LENGTH)
  content?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(SAFE_URL_PATTERN, { message: 'thumbnailURL must be an https URL or a site-relative path' })
  thumbnailURL?: string | null;

  @IsOptional()
  @IsIn(BLOG_STATUSES)
  status?: BlogStatus;

  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsISO8601()
  publishedAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;
}

export class ListBlogsQueryDto {
  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(14)
  categoryID?: string;

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  featured?: boolean;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

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

export class ManageBlogsQueryDto extends ListBlogsQueryDto {
  /** Only posts written by the signed-in user. */
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  mine?: boolean;

  @IsOptional()
  @IsIn(BLOG_STATUSES)
  status?: BlogStatus;
}
