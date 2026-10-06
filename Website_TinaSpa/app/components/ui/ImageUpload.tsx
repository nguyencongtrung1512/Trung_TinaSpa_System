import { useRef, useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_MB, uploadImage, validateImageFile, type StorageFolder } from '~/lib/storage'
import { inputClass, outlineButtonClass } from '~/portal/manager/services/form-ui'

const defaultLabels = {
  choose: 'Chọn ảnh',
  replace: 'Đổi ảnh',
  remove: 'Gỡ ảnh',
  uploading: 'Đang tải lên',
  hint: `JPG, PNG, WEBP, GIF · tối đa ${MAX_IMAGE_SIZE_MB} MB`,
  urlPlaceholder: 'Hoặc dán đường dẫn ảnh'
}

export type ImageUploadLabels = typeof defaultLabels

export interface ImageUploadProps {
  readonly id?: string
  readonly value: string
  readonly folder: StorageFolder
  readonly onChange: (url: string) => void
  readonly onUploadingChange?: (uploading: boolean) => void
  readonly allowUrlInput?: boolean
  readonly labels?: Partial<ImageUploadLabels>
}

export function ImageUpload({
  id,
  value,
  folder,
  onChange,
  onUploadingChange,
  allowUrlInput = true,
  labels
}: ImageUploadProps) {
  const text = { ...defaultLabels, ...labels }
  const fileInput = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string>()
  const [broken, setBroken] = useState(false)
  const uploading = progress !== null
  const preview = value.trim()

  async function upload(file: File) {
    const invalid = validateImageFile(file)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(undefined)
    setProgress(0)
    onUploadingChange?.(true)
    try {
      const { publicUrl } = await uploadImage(file, folder, setProgress)
      setBroken(false)
      onChange(publicUrl)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Tải ảnh lên thất bại.')
    } finally {
      setProgress(null)
      onUploadingChange?.(false)
    }
  }

  return (
    <div>
      <div className='flex items-center gap-4'>
        <span className='grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-rose-soft bg-mist text-clinic'>
          {preview && !broken ? (
            <img src={preview} alt='' className='size-full object-cover' onError={() => setBroken(true)} />
          ) : (
            <Icon name={broken ? 'broken_image' : 'image'} size={28} />
          )}
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              className={outlineButtonClass}
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              <Icon name='upload' size={18} />
              {uploading ? `${text.uploading} ${progress}%` : preview ? text.replace : text.choose}
            </button>
            {preview && !uploading ? (
              <button
                type='button'
                className={outlineButtonClass}
                onClick={() => {
                  setError(undefined)
                  setBroken(false)
                  onChange('')
                }}
              >
                <Icon name='delete' size={18} />
                {text.remove}
              </button>
            ) : null}
          </div>
          {uploading ? (
            <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-rose-soft' role='progressbar' aria-valuenow={progress}>
              <div className='h-full rounded-full bg-clinic transition-all' style={{ width: `${progress}%` }} />
            </div>
          ) : (
            <p className='mt-1.5 text-xs text-muted'>{text.hint}</p>
          )}
        </div>
        <input
          ref={fileInput}
          type='file'
          accept={IMAGE_ACCEPT}
          className='hidden'
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) void upload(file)
          }}
        />
      </div>
      {allowUrlInput ? (
        <input
          id={id}
          className={`${inputClass} mt-3`}
          value={value}
          disabled={uploading}
          placeholder={text.urlPlaceholder}
          onChange={(event) => {
            setBroken(false)
            onChange(event.target.value)
          }}
        />
      ) : null}
      {error ? (
        <p role='alert' className='mt-2 text-xs text-clinic'>
          {error}
        </p>
      ) : null}
    </div>
  )
}
