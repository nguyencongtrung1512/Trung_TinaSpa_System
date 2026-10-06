import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/decorators/transforms.js';
import {
  ALLOWED_CONTENT_TYPES,
  OBJECT_KEY_PATTERN,
  STORAGE_FOLDERS,
  type ImageContentType,
  type StorageFolder,
} from '../storage.constants.js';

export class CreatePresignedUploadDto {
  @IsIn(STORAGE_FOLDERS)
  folder: StorageFolder;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName: string;

  @Trim()
  @IsIn(ALLOWED_CONTENT_TYPES)
  contentType: ImageContentType;

  @IsInt()
  @Min(1)
  fileSize: number;
}

export class ObjectKeyDto {
  @Trim()
  @IsString()
  @MaxLength(255)
  @Matches(OBJECT_KEY_PATTERN, { message: 'key is not a valid storage key' })
  key: string;
}
