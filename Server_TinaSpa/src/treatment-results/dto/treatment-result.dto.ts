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
import {
  SAFE_URL_PATTERN,
  stripHtml,
} from '../../common/utils/html-sanitizer.util.js';

const PlainText = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? stripHtml(value) : value,
  );

/** Create + update payload; `TreatmentResultsService.create` enforces the required fields. */
export class SaveTreatmentResultDto {
  @PlainText()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleVietnamese?: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleEnglish?: string | null;

  @PlainText()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  resultVietnamese?: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  resultEnglish?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summaryVietnamese?: string | null;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summaryEnglish?: string | null;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_URL_PATTERN, { message: 'beforeImage must be a safe URL' })
  beforeImage?: string;

  @Trim()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_URL_PATTERN, { message: 'afterImage must be a safe URL' })
  afterImage?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  sessionCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  durationWeeks?: number;

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
