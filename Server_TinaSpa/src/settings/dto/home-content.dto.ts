import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import {
  SAFE_URL_PATTERN,
  stripHtml,
} from '../../common/utils/html-sanitizer.util.js';
import {
  HOME_PROCESS_ICONS,
  HOME_PROCESS_MAX_STEPS,
  HOME_TEAM_MAX_MEMBERS,
} from '../settings.constants.js';

const PlainText = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? stripHtml(value) : value,
  );

export class HomeTeamMemberDto {
  @PlainText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameVietnamese!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEnglish?: string | null;

  @PlainText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  roleVietnamese!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  roleEnglish?: string | null;

  @Trim()
  @IsString()
  @MaxLength(2048)
  @Matches(SAFE_URL_PATTERN, { message: 'image must be a safe URL' })
  image!: string;
}

export class SaveHomeTeamDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(HOME_TEAM_MAX_MEMBERS)
  @ValidateNested({ each: true })
  @Type(() => HomeTeamMemberDto)
  members!: HomeTeamMemberDto[];
}

export class HomeProcessStepDto {
  @IsIn(HOME_PROCESS_ICONS)
  icon!: (typeof HOME_PROCESS_ICONS)[number];

  @PlainText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  titleVietnamese!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  titleEnglish?: string | null;

  @PlainText()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  descriptionVietnamese!: string;

  @PlainText()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descriptionEnglish?: string | null;
}

export class SaveHomeProcessDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(HOME_PROCESS_MAX_STEPS)
  @ValidateNested({ each: true })
  @Type(() => HomeProcessStepDto)
  steps!: HomeProcessStepDto[];
}
