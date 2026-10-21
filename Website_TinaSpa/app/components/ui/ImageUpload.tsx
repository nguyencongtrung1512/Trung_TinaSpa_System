import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '~/components/ui/Icon'
import { IMAGE_ACCEPT, MAX_IMAGE_SIZE_MB, uploadImage, validateImageFile, type StorageFolder } from '~/lib/storage'
import { inputClass, outlineButtonClass } from '~/portal/manager/services/form-ui'

const defaultLabels = {
  choose: 'Chọn ảnh',
  replace: 'Đổi ảnh',
  remove: 'Gỡ ảnh',
  uploading: 'Đang tải lên',
  hint: `JPG, PNG, WEBP, GIF · tối đa ${MAX_IMAGE_SIZE_MB} MB`,
  urlPlaceholder: 'Hoặc dán đường dẫn ảnh',
  preview: 'Xem ảnh lớn',
  close: 'Đóng'
}

export type ImageUploadLabels = typeof defaultLabels

/** Full-size view; portalled to body so it escapes dialogs that clip or transform their content. */
function ImagePreview({
  src,
  closeLabel,
  onClose
}: {
  readonly src: string
  readonly closeLabel: string
  readonly onClose: () => void
}) {
  useEffect(() => {
    // Capture phase so Escape closes only the preview, not the dialog underneath.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return createPortal(
    <div
      role='dialog'
      aria-modal='true'
      aria-label={closeLabel}
      className='fixed inset-0 z-[80] grid place-items-center p-4'
    >
      <button type='button' aria-label={closeLabel} className='absolute inset-0 bg-ink/80' onClick={onClose} />
      <img src={src} alt='' className='relative max-h-[85dvh] max-w-full rounded-2xl object-contain shadow-2xl' />
      <button
        type='button'
        aria-label={closeLabel}
        className='absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white'
        onClick={onClose}
      >
        <Icon name='close' size={20} />
      </button>
    </div>,
    document.body
  )
}

/** Alt text from an uploaded file name: `uu-dai_thang-11.png` → `uu dai thang 11`. */
export function altFromFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replaceAll(/[-_]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .slice(0, 255)
}

export interface ImageUploadProps {
  readonly id?: string
  readonly value: string
  readonly folder: StorageFolder
  /** `alt` is derived from the uploaded file name, and '' when the image is removed; absent for a typed URL. */
  readonly onChange: (url: string, alt?: string) => void
  readonly onUploadingChange?: (uploading: boolean) => void
  /** Shows a text box to paste an image URL; off by default. */
  readonly allowUrlInput?: boolean
  readonly labels?: Partial<ImageUploadLabels>
}

export function ImageUpload({
  id,
  value,
  folder,
  onChange,
  onUploadingChange,
  allowUrlInput = false,
  labels
}: ImageUploadProps) {
  const text = { ...defaultLabels, ...labels }
  const fileInput = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string>()
  const [broken, setBroken] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
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
      onChange(publicUrl, altFromFileName(file.name))
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
        {preview && !broken ? (
          <button
            type='button'
            aria-label={text.preview}
            title={text.preview}
            className='group relative size-20 shrink-0 overflow-hidden rounded-2xl border border-rose-soft bg-mist'
            onClick={() => setPreviewOpen(true)}
          >
            <img src={preview} alt='' className='size-full object-cover' onError={() => setBroken(true)} />
            <span className='absolute inset-0 grid place-items-center bg-ink/40 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100'>
              <Icon name='zoom_in' size={24} />
            </span>
          </button>
        ) : (
          <span className='grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-rose-soft bg-mist text-clinic'>
            <Icon name={broken ? 'broken_image' : 'image'} size={28} />
          </span>
        )}
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap gap-2'>
            <button
              id={allowUrlInput ? undefined : id}
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
                  onChange('', '')
                }}
              >
                <Icon name='delete' size={18} />
                {text.remove}
              </button>
            ) : null}
          </div>
          {uploading ? (
            <div
              className='mt-2 h-1.5 overflow-hidden rounded-full bg-rose-soft'
              role='progressbar'
              aria-valuenow={progress}
            >
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
      {previewOpen && preview ? (
        <ImagePreview src={preview} closeLabel={text.close} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </div>
  )
}
