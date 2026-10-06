import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_MAX_FILE_SIZE_MB,
  DEFAULT_PRESIGNED_EXPIRES_IN,
  DEFAULT_R2_BUCKET,
  DEFAULT_R2_REGION,
} from './storage.constants.js';

export type R2Credentials = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  publicUrl: string;
};

export type StorageSettings = {
  bucket: string;
  region: string;
  presignedExpiresIn: number;
  maxFileSize: number;
  /** `undefined` when any required variable is missing; see `missing`. */
  credentials?: R2Credentials;
  missing: string[];
  warnings: string[];
};

const MAX_PRESIGNED_EXPIRES_IN = 7 * 24 * 60 * 60;

function positiveInt(value: string | undefined, fallback: number, max?: number) {
  const parsed = Number(value);
  if (!value || !Number.isInteger(parsed) || parsed <= 0) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

/**
 * The SDK puts the bucket into the hostname itself, so any path on the endpoint
 * (e.g. `/tinaspa-images`) would silently become a prefix of every object key.
 */
function normalizeEndpoint(value: string | undefined, warnings: string[]) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.pathname !== '/') {
      warnings.push('R2_ENDPOINT should not include a path; using its origin only');
    }
    return url.origin;
  } catch {
    warnings.push('R2_ENDPOINT is not a valid URL');
    return undefined;
  }
}

export function readStorageSettings(config: ConfigService): StorageSettings {
  const get = (name: string) => config.get<string>(name)?.trim() || undefined;
  const warnings: string[] = [];

  const accountId = get('R2_ACCOUNT_ID');
  const values = {
    R2_ACCESS_KEY_ID: get('R2_ACCESS_KEY_ID'),
    R2_SECRET_ACCESS_KEY: get('R2_SECRET_ACCESS_KEY'),
    R2_ENDPOINT: normalizeEndpoint(
      get('R2_ENDPOINT') ??
        (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
      warnings,
    ),
    R2_PUBLIC_URL: get('R2_PUBLIC_URL')?.replace(/\/+$/, ''),
  };
  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  return {
    bucket: get('R2_BUCKET_NAME') ?? DEFAULT_R2_BUCKET,
    region: get('R2_REGION') ?? DEFAULT_R2_REGION,
    presignedExpiresIn: positiveInt(
      get('R2_PRESIGNED_EXPIRES_IN'),
      DEFAULT_PRESIGNED_EXPIRES_IN,
      MAX_PRESIGNED_EXPIRES_IN,
    ),
    maxFileSize:
      positiveInt(get('STORAGE_MAX_FILE_SIZE_MB'), DEFAULT_MAX_FILE_SIZE_MB) *
      1024 *
      1024,
    credentials: missing.length
      ? undefined
      : {
          accessKeyId: values.R2_ACCESS_KEY_ID!,
          secretAccessKey: values.R2_SECRET_ACCESS_KEY!,
          endpoint: values.R2_ENDPOINT!,
          publicUrl: values.R2_PUBLIC_URL!,
        },
    missing,
    warnings,
  };
}
