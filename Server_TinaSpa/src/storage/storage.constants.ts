import { RoleName } from '../common/constants/roles.js';

export const StorageFolder = {
  SERVICES: 'services',
  PRODUCTS: 'products',
  BLOGS: 'blogs',
  STAFF: 'staff',
  AVATARS: 'avatars',
  SETTINGS: 'settings',
  RESULTS: 'results',
} as const;

export type StorageFolder = (typeof StorageFolder)[keyof typeof StorageFolder];

export const STORAGE_FOLDERS = Object.values(StorageFolder);

/** Roles allowed to upload into a folder; `null` means any authenticated user. */
export const FOLDER_UPLOAD_ROLES: Record<StorageFolder, RoleName[] | null> = {
  services: [RoleName.ADMIN, RoleName.MANAGER],
  products: [RoleName.ADMIN, RoleName.MANAGER],
  blogs: [RoleName.ADMIN, RoleName.MANAGER],
  staff: [RoleName.ADMIN, RoleName.MANAGER],
  avatars: null,
  settings: [RoleName.ADMIN],
  results: [RoleName.ADMIN, RoleName.MANAGER],
};

/** Allowed content types → accepted file extensions. The first one is used in the object key. */
export const IMAGE_CONTENT_TYPES = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
} as const satisfies Record<string, readonly string[]>;

export type ImageContentType = keyof typeof IMAGE_CONTENT_TYPES;

export const ALLOWED_CONTENT_TYPES = Object.keys(
  IMAGE_CONTENT_TYPES,
) as ImageContentType[];

const KEY_EXTENSIONS = ALLOWED_CONTENT_TYPES.map(
  (type) => IMAGE_CONTENT_TYPES[type][0],
);

/** `{folder}/{yyyy}/{MM}/{uuid}.{ext}` — the only shape of key this backend creates or deletes. */
export const OBJECT_KEY_PATTERN = new RegExp(
  `^(${STORAGE_FOLDERS.join('|')})/\\d{4}/(0[1-9]|1[0-2])/` +
    `[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` +
    `\\.(${KEY_EXTENSIONS.join('|')})$`,
);

export const DEFAULT_R2_BUCKET = 'tinaspa-images';
export const DEFAULT_R2_REGION = 'auto';
export const DEFAULT_PRESIGNED_EXPIRES_IN = 900;
export const DEFAULT_MAX_FILE_SIZE_MB = 10;
