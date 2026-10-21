import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';

export class SavePopupBannerDto {
  @IsBoolean()
  enabled!: boolean;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageAlt?: string | null;

  @Trim()
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  link?: string | null;
}
