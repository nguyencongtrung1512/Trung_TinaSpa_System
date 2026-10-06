import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { RoleName } from '../common/constants/roles.js';
import { OBJECT_KEY_PATTERN } from './storage.constants.js';
import { StorageService } from './storage.service.js';

const ENV = {
  R2_ACCOUNT_ID: 'account123',
  R2_ACCESS_KEY_ID: 'test-access-key',
  R2_SECRET_ACCESS_KEY: 'test-secret-key',
  R2_BUCKET_NAME: 'tinaspa-images',
  R2_ENDPOINT: 'https://account123.r2.cloudflarestorage.com',
  R2_PUBLIC_URL: 'https://pub-test.r2.dev/',
  R2_REGION: 'auto',
};

const createService = (env: Record<string, string> = ENV) =>
  new StorageService(new ConfigService(env));

const manager = { roles: [RoleName.MANAGER] };
const customer = { roles: [RoleName.CUSTOMER] };
const validKey = 'services/2026/10/8f2c9e1a-1234-4abc-9def-0123456789ab.webp';

describe('StorageService', () => {
  afterEach(() => vi.restoreAllMocks());

  describe('createPresignedUpload', () => {
    it('returns a presigned PUT URL bound to content type and size', async () => {
      const result = await createService().createPresignedUpload(
        { folder: 'services', fileName: 'Service.WEBP', contentType: 'image/webp', fileSize: 123456 },
        manager,
      );

      expect(result.key).toMatch(OBJECT_KEY_PATTERN);
      expect(result.key.startsWith('services/')).toBe(true);
      expect(result.publicUrl).toBe(`https://pub-test.r2.dev/${result.key}`);
      expect(result.expiresIn).toBe(900);
      expect(result.headers).toEqual({ 'Content-Type': 'image/webp' });

      const url = new URL(result.uploadUrl);
      expect(url.host).toBe('tinaspa-images.account123.r2.cloudflarestorage.com');
      expect(url.searchParams.get('X-Amz-Expires')).toBe('900');
      expect(url.searchParams.get('X-Amz-SignedHeaders')).toBe(
        'content-length;content-type;host',
      );
      expect(url.searchParams.has('x-amz-checksum-crc32')).toBe(false);
      expect(result.uploadUrl).not.toContain(ENV.R2_SECRET_ACCESS_KEY);
      expect(JSON.stringify(result)).not.toContain(ENV.R2_SECRET_ACCESS_KEY);
    });

    it('ignores a bucket path appended to R2_ENDPOINT', async () => {
      const result = await createService({
        ...ENV,
        R2_ENDPOINT: `${ENV.R2_ENDPOINT}/tinaspa-images`,
      }).createPresignedUpload(
        { folder: 'services', fileName: 'a.png', contentType: 'image/png', fileSize: 10 },
        manager,
      );
      const url = new URL(result.uploadUrl);
      expect(url.host).toBe('tinaspa-images.account123.r2.cloudflarestorage.com');
      expect(url.pathname).toBe(`/${result.key}`);
    });

    it('lets any authenticated user upload avatars', async () => {
      const result = await createService().createPresignedUpload(
        { folder: 'avatars', fileName: 'me.jpeg', contentType: 'image/jpeg', fileSize: 10 },
        customer,
      );
      expect(result.key).toMatch(/^avatars\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.jpg$/);
    });

    it('rejects customers uploading to management folders', async () => {
      await expect(
        createService().createPresignedUpload(
          { folder: 'services', fileName: 'a.png', contentType: 'image/png', fileSize: 10 },
          customer,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('rejects files over the size limit', async () => {
      await expect(
        createService().createPresignedUpload(
          { folder: 'services', fileName: 'a.png', contentType: 'image/png', fileSize: 10 * 1024 * 1024 + 1 },
          manager,
        ),
      ).rejects.toBeInstanceOf(PayloadTooLargeException);
    });

    it('honours STORAGE_MAX_FILE_SIZE_MB', async () => {
      await expect(
        createService({ ...ENV, STORAGE_MAX_FILE_SIZE_MB: '1' }).createPresignedUpload(
          { folder: 'services', fileName: 'a.png', contentType: 'image/png', fileSize: 2 * 1024 * 1024 },
          manager,
        ),
      ).rejects.toBeInstanceOf(PayloadTooLargeException);
    });

    it.each([
      ['a.png', 'image/webp'],
      ['a.exe', 'image/png'],
      ['noextension', 'image/png'],
      ['a.svg', 'image/svg+xml'],
    ])('rejects %s with %s', async (fileName, contentType) => {
      await expect(
        createService().createPresignedUpload(
          { folder: 'services', fileName, contentType: contentType as 'image/png', fileSize: 10 },
          manager,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects unknown folders', async () => {
      await expect(
        createService().createPresignedUpload(
          { folder: 'root' as 'services', fileName: 'a.png', contentType: 'image/png', fileSize: 10 },
          manager,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reports missing configuration without leaking values', async () => {
      const { R2_SECRET_ACCESS_KEY: _secret, ...partial } = ENV;
      await expect(
        createService(partial).createPresignedUpload(
          { folder: 'services', fileName: 'a.png', contentType: 'image/png', fileSize: 10 },
          manager,
        ),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('generateObjectKey', () => {
    it('never reuses the original filename and avoids collisions', () => {
      const service = createService();
      const keys = new Set(
        Array.from({ length: 50 }, () => service.generateObjectKey('blogs', 'photo.png')),
      );
      expect(keys.size).toBe(50);
      for (const key of keys) {
        expect(key).toMatch(OBJECT_KEY_PATTERN);
        expect(key).not.toContain('photo');
      }
    });
  });

  describe('getObject / deleteObject', () => {
    it('returns object metadata', async () => {
      const send = vi
        .spyOn(S3Client.prototype, 'send')
        .mockResolvedValue({ ContentType: 'image/webp', ContentLength: 42 } as never);

      const info = await createService().getObject(validKey);

      expect(send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand);
      expect(info).toMatchObject({
        key: validKey,
        publicUrl: `https://pub-test.r2.dev/${validKey}`,
        contentType: 'image/webp',
        size: 42,
      });
    });

    it('maps a missing object to 404', async () => {
      vi.spyOn(S3Client.prototype, 'send').mockRejectedValue(
        new S3ServiceException({ name: 'NotFound', $fault: 'client', $metadata: { httpStatusCode: 404 } }),
      );
      const service = createService();
      await expect(service.getObject(validKey)).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.objectExists(validKey)).resolves.toBe(false);
    });

    it('deletes an existing object', async () => {
      const send = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({} as never);
      await createService().deleteObject(validKey);
      expect(send.mock.calls[1][0]).toBeInstanceOf(DeleteObjectCommand);
      expect((send.mock.calls[1][0] as DeleteObjectCommand).input).toEqual({
        Bucket: 'tinaspa-images',
        Key: validKey,
      });
    });

    it('maps provider failures to 502', async () => {
      vi.spyOn(S3Client.prototype, 'send')
        .mockResolvedValueOnce({} as never)
        .mockRejectedValueOnce(
          new S3ServiceException({ name: 'InternalError', $fault: 'server', $metadata: { httpStatusCode: 500 } }),
        );
      await expect(createService().deleteObject(validKey)).rejects.toBeInstanceOf(
        BadGatewayException,
      );
    });

    it.each([
      'services/2026/10/../../secret.webp',
      'other/2026/10/8f2c9e1a-1234-4abc-9def-0123456789ab.webp',
      'services/8f2c9e1a-1234-4abc-9def-0123456789ab.webp',
      '/services/2026/10/8f2c9e1a-1234-4abc-9def-0123456789ab.webp',
    ])('rejects key %s before calling R2', async (key) => {
      const send = vi.spyOn(S3Client.prototype, 'send');
      await expect(createService().deleteObject(key)).rejects.toBeInstanceOf(BadRequestException);
      expect(send).not.toHaveBeenCalled();
    });
  });
});
