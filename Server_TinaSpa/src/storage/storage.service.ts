import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import type { AuthUser } from '../auth/types/auth-user.js';
import type { CreatePresignedUploadDto } from './dto/storage.dto.js';
import { readStorageSettings, type R2Credentials, type StorageSettings } from './storage.config.js';
import {
  FOLDER_UPLOAD_ROLES,
  IMAGE_CONTENT_TYPES,
  OBJECT_KEY_PATTERN,
  STORAGE_FOLDERS,
  type ImageContentType,
  type StorageFolder,
} from './storage.constants.js';

export type PresignedUpload = {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
  method: 'PUT';
  headers: { 'Content-Type': string };
};

export type StorageObjectInfo = {
  key: string;
  publicUrl: string;
  contentType: string | null;
  size: number | null;
  lastModified: Date | null;
};

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly settings: StorageSettings;
  private client?: S3Client;

  constructor(config: ConfigService) {
    this.settings = readStorageSettings(config);
    for (const warning of this.settings.warnings) this.logger.warn(warning);
    if (this.settings.missing.length) {
      this.logger.warn(
        `Cloudflare R2 is not configured; missing: ${this.settings.missing.join(', ')}`,
      );
    }
  }

  get maxFileSize(): number {
    return this.settings.maxFileSize;
  }

  async createPresignedUpload(
    dto: CreatePresignedUploadDto,
    user: Pick<AuthUser, 'roles'>,
  ): Promise<PresignedUpload> {
    this.assertCanUpload(dto.folder, user.roles);
    this.assertValidFile(dto.fileName, dto.contentType, dto.fileSize);

    const client = this.getClient();
    const key = this.generateObjectKey(dto.folder, dto.fileName, dto.contentType);
    const command = new PutObjectCommand({
      Bucket: this.settings.bucket,
      Key: key,
      ContentType: dto.contentType,
      ContentLength: dto.fileSize,
    });

    try {
      const uploadUrl = await getSignedUrl(client, command, {
        expiresIn: this.settings.presignedExpiresIn,
        // Signing these forces the browser PUT to match the validated type and size.
        signableHeaders: new Set(['content-type', 'content-length']),
      });
      return {
        uploadUrl,
        key,
        publicUrl: this.getPublicUrl(key),
        expiresIn: this.settings.presignedExpiresIn,
        method: 'PUT',
        headers: { 'Content-Type': dto.contentType },
      };
    } catch (error) {
      throw this.toHttpError(error, 'generate presigned upload URL');
    }
  }

  generateObjectKey(
    folder: StorageFolder,
    originalFilename: string,
    contentType?: ImageContentType,
  ): string {
    if (!STORAGE_FOLDERS.includes(folder)) {
      throw new BadRequestException('Invalid storage folder');
    }
    const extension = contentType
      ? IMAGE_CONTENT_TYPES[contentType][0]
      : this.contentTypeFromFileName(originalFilename)?.extension;
    if (!extension) {
      throw new BadRequestException('Unsupported file extension');
    }

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${folder}/${year}/${month}/${randomUUID()}.${extension}`;
  }

  getPublicUrl(key: string): string {
    return `${this.getCredentials().publicUrl}/${key}`;
  }

  async getObject(key: string): Promise<StorageObjectInfo> {
    this.assertValidKey(key);
    const client = this.getClient();
    try {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: this.settings.bucket, Key: key }),
      );
      return {
        key,
        publicUrl: this.getPublicUrl(key),
        contentType: head.ContentType ?? null,
        size: head.ContentLength ?? null,
        lastModified: head.LastModified ?? null,
      };
    } catch (error) {
      throw this.toHttpError(error, 'check object');
    }
  }

  async objectExists(key: string): Promise<boolean> {
    try {
      await this.getObject(key);
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) return false;
      throw error;
    }
  }

  async deleteObject(key: string): Promise<void> {
    // R2 answers 204 for missing keys too, so check first to report 404.
    await this.getObject(key);
    try {
      await this.getClient().send(
        new DeleteObjectCommand({ Bucket: this.settings.bucket, Key: key }),
      );
    } catch (error) {
      throw this.toHttpError(error, 'delete object');
    }
  }

  assertValidKey(key: string): void {
    if (typeof key !== 'string' || !OBJECT_KEY_PATTERN.test(key)) {
      throw new BadRequestException('Invalid storage key');
    }
  }

  private assertCanUpload(folder: StorageFolder, roles: string[]): void {
    if (!STORAGE_FOLDERS.includes(folder)) {
      throw new BadRequestException('Invalid storage folder');
    }
    const allowed = FOLDER_UPLOAD_ROLES[folder];
    if (allowed && !allowed.some((role) => roles.includes(role))) {
      throw new ForbiddenException(`Not allowed to upload to "${folder}"`);
    }
  }

  private assertValidFile(
    fileName: string,
    contentType: ImageContentType,
    fileSize: number,
  ): void {
    if (!(contentType in IMAGE_CONTENT_TYPES)) {
      throw new BadRequestException('Unsupported content type');
    }
    const fromName = this.contentTypeFromFileName(fileName);
    if (!fromName) {
      throw new BadRequestException('Unsupported file extension');
    }
    if (fromName.contentType !== contentType) {
      throw new BadRequestException('File extension does not match content type');
    }
    if (!Number.isInteger(fileSize) || fileSize <= 0) {
      throw new BadRequestException('Invalid file size');
    }
    if (fileSize > this.settings.maxFileSize) {
      throw new PayloadTooLargeException(
        `File exceeds ${this.settings.maxFileSize / 1024 / 1024} MB limit`,
      );
    }
  }

  private contentTypeFromFileName(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension || extension === fileName.toLowerCase()) return undefined;
    for (const [contentType, extensions] of Object.entries(IMAGE_CONTENT_TYPES)) {
      if ((extensions as readonly string[]).includes(extension)) {
        return { contentType: contentType as ImageContentType, extension: extensions[0] };
      }
    }
    return undefined;
  }

  private getCredentials(): R2Credentials {
    if (!this.settings.credentials) {
      throw new ServiceUnavailableException('File storage is not configured');
    }
    return this.settings.credentials;
  }

  private getClient(): S3Client {
    const credentials = this.getCredentials();
    this.client ??= new S3Client({
      region: this.settings.region,
      endpoint: credentials.endpoint,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      // R2 rejects the default CRC32 checksum params the SDK adds to presigned URLs.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
    return this.client;
  }

  private toHttpError(error: unknown, action: string): HttpException {
    if (error instanceof HttpException) return error;

    const status =
      error instanceof S3ServiceException ? error.$metadata?.httpStatusCode : undefined;
    const name = error instanceof Error ? error.name : 'UnknownError';
    if (status === 404 || name === 'NotFound' || name === 'NoSuchKey') {
      return new NotFoundException('Object not found');
    }

    this.logger.error(`R2 failed to ${action}: ${name}${status ? ` (HTTP ${status})` : ''}`);
    return new BadGatewayException(`Storage provider failed to ${action}`);
  }
}
