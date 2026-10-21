import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { useToast } from '~/components/ui/toast-view'
import { popupBannerApi, type PopupBanner } from '~/lib/popup-banner'
import { formatPortalDate } from '~/portal/format'
import {
  Field,
  FormError,
  Toggle,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'

interface PopupValues {
  enabled: boolean
  image: string
  imageAlt: string
  link: string
}

const toValues = (banner: PopupBanner): PopupValues => ({
  enabled: banner.enabled,
  image: banner.image ?? '',
  imageAlt: banner.imageAlt ?? '',
  link: banner.link ?? ''
})

const blank = (value: string) => value.trim() || null

function PopupBannerCard() {
  const toast = useToast()
  const [values, setValues] = useState<PopupValues>()
  const [loadError, setLoadError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoadError(undefined)
    popupBannerApi
      .getForManage()
      .then((banner) => {
        if (!cancelled) setValues(toValues(banner))
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được cấu hình popup.')
      })
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const update = <K extends keyof PopupValues>(key: K, value: PopupValues[K]) =>
    setValues((current) => (current ? { ...current, [key]: value } : current))

  async function save() {
    if (!values) return
    if (values.enabled && !values.image.trim()) {
      setSubmitError('Hãy chọn ảnh trước khi bật popup.')
      return
    }
    setBusy(true)
    setSubmitError(undefined)
    try {
      const saved = await popupBannerApi.save({
        enabled: values.enabled,
        image: blank(values.image),
        imageAlt: blank(values.imageAlt),
        link: blank(values.link)
      })
      setValues(toValues(saved))
      toast.success(saved.enabled ? 'Đã lưu và bật popup banner.' : 'Đã lưu cấu hình popup banner (đang tắt).')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không lưu được cấu hình.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={`${portalCardClass} p-5 sm:p-6`} aria-labelledby='popup-banner-title'>
      <div className='flex items-start gap-4'>
        <span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-mist text-clinic'>
          <Icon name='web_asset' size={22} />
        </span>
        <div>
          <h2 id='popup-banner-title' className='text-lg font-extrabold text-ink'>
            Popup banner trang chủ
          </h2>
          <p className='text-sm text-muted'>
            Ảnh hiện lên khi khách vừa vào website. Khách bấm ra ngoài ảnh hoặc nút đóng thì popup biến mất và không
            hiện lại trong lượt truy cập đó.
          </p>
        </div>
      </div>

      {loadError ? (
        <div className='mt-6 flex flex-col items-center gap-3 py-8 text-center'>
          <Icon name='cloud_off' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{loadError}</p>
          <button type='button' className={outlineButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      ) : !values ? (
        <div className='mt-6 h-64 animate-pulse rounded-2xl bg-canvas' />
      ) : (
        <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'>
          <div className='space-y-4'>
            <Toggle
              label='Hiển thị popup'
              description={values.enabled ? 'Khách sẽ thấy popup khi vào website.' : 'Popup đang tắt.'}
              checked={values.enabled}
              onChange={(value) => update('enabled', value)}
            />
            <Field
              label='Ảnh popup'
              required={values.enabled}
              hint='Nên dùng ảnh dọc hoặc vuông, rộng tối thiểu 800px.'
            >
              {(id) => (
                <ImageUpload
                  id={id}
                  folder='settings'
                  value={values.image}
                  onChange={(url, alt) => {
                    update('image', url)
                    if (alt !== undefined) update('imageAlt', alt)
                  }}
                  onUploadingChange={setUploading}
                />
              )}
            </Field>
            <Field label='Liên kết khi bấm vào ảnh' hint='Để trống nếu không cần. VD: /booking hoặc /products.'>
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  value={values.link}
                  maxLength={2048}
                  placeholder='/booking'
                  onChange={(event) => update('link', event.target.value)}
                />
              )}
            </Field>
            <FormError message={submitError} />
            <button
              type='button'
              className={primaryButtonClass}
              disabled={busy || uploading}
              onClick={() => void save()}
            >
              <Icon name='save' size={18} />
              {busy ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>

          <div>
            <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>Xem trước</p>
            <div className='relative mt-2 grid min-h-[360px] place-items-center overflow-hidden rounded-3xl bg-ink/60 p-6 sm:min-h-[480px] sm:p-10'>
              {values.image ? (
                <div className='relative'>
                  <img
                    src={values.image}
                    alt=''
                    className='max-h-[60dvh] max-w-full rounded-3xl object-contain shadow-2xl sm:max-h-[520px]'
                  />
                  <span className='absolute -top-3 -right-3 grid size-10 place-items-center rounded-full bg-white text-ink shadow-lg'>
                    <Icon name='close' size={20} />
                  </span>
                </div>
              ) : (
                <p className='text-sm text-white/80'>Chưa chọn ảnh</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/** Cấu hình hệ thống (chỉ quản trị). Hiện có: popup banner trang chủ. */
export function SettingsPage() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header>
        <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
          <span>{portalRoleLabel.admin}</span>
          <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
        </div>
        <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Cấu hình</h1>
        <p className='mt-1 text-sm text-muted'>Thiết lập dùng chung cho website và cổng quản trị.</p>
      </header>

      <div className='mt-6'>
        <PopupBannerCard />
      </div>
    </motion.div>
  )
}
