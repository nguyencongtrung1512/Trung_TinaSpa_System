import { ApiError, apiRequest } from '~/lib/api'

export type StorageFolder = 'services' | 'products' | 'blogs' | 'staff' | 'avatars' | 'settings'

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export const MAX_IMAGE_SIZE_MB = 10

const ALLOWED_TYPES = new Set(IMAGE_ACCEPT.split(','))

interface PresignedUpload {
  readonly uploadUrl: string
  readonly key: string
  readonly publicUrl: string
  readonly expiresIn: number
  readonly headers: Readonly<Record<string, string>>
}

export interface UploadedImage {
  readonly key: string
  readonly publicUrl: string
}

/** Returns an error message, or `undefined` when the file can be uploaded. */
export function validateImageFile(file: File): string | undefined {
  if (!ALLOWED_TYPES.has(file.type)) return 'Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.'
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) return `Ảnh vượt quá ${MAX_IMAGE_SIZE_MB} MB.`
  return undefined
}

function putToStorage(upload: PresignedUpload, file: File, onProgress?: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', upload.uploadUrl)
    for (const [name, value] of Object.entries(upload.headers)) request.setRequestHeader(name, value)
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new ApiError('Tải ảnh lên thất bại. Vui lòng thử lại.', request.status))
    request.onerror = () => reject(new ApiError('Không thể kết nối kho lưu trữ ảnh. Vui lòng thử lại.', 0))
    request.send(file)
  })
}

/** Gets a presigned URL from the API, then uploads the file straight to Cloudflare R2. */
export async function uploadImage(
  file: File,
  folder: StorageFolder,
  onProgress?: (percent: number) => void
): Promise<UploadedImage> {
  const invalid = validateImageFile(file)
  if (invalid) throw new ApiError(invalid, 400)

  const upload = await apiRequest<PresignedUpload>('/storage/presigned-upload', {
    method: 'POST',
    auth: true,
    body: { folder, fileName: file.name, contentType: file.type, fileSize: file.size }
  })
  await putToStorage(upload, file, onProgress)
  return { key: upload.key, publicUrl: upload.publicUrl }
}
