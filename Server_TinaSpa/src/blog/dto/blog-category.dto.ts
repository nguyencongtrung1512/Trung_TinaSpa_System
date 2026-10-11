import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import { stripHtml } from '../../common/utils/html-sanitizer.util.js';
import { SLUG_PATTERN } from '../../service-catalog/service-catalog.constants.js';

const PlainText = () =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? stripHtml(value) : value));

/** Create + update payload; `BlogCategoriesService.create` enforces nameVietnamese and slug. */
export class SaveBlogCategoryDto {
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
  @MaxLength(255)
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase letters, digits and hyphens' })
  slug?: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string | null;
}
