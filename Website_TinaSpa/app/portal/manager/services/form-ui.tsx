import { useEffect, useId, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'

export const inputClass =
  'w-full rounded-2xl border border-rose-soft bg-white px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-clinic focus:ring-2 focus:ring-clinic/15'

export const primaryButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-clinic px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(225,29,116,0.22)] transition hover:bg-clinic-deep disabled:cursor-not-allowed disabled:opacity-60'

export const outlineButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-rose-soft bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-clinic hover:text-clinic disabled:cursor-not-allowed disabled:opacity-60'

export const iconButtonClass =
  'inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-mist hover:text-clinic'

export interface PortalDialogProps {
  readonly open: boolean
  readonly title: string
  readonly description?: string
  readonly onClose: () => void
  readonly children: ReactNode
  readonly footer?: ReactNode
  readonly onSubmit?: (event: FormEvent<HTMLFormElement>) => void
  readonly size?: 'md' | 'lg'
}

export function PortalDialog({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  onSubmit,
  size = 'lg'
}: PortalDialogProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key='dialog'
          className='fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type='button' aria-label='Đóng' className='absolute inset-0 bg-ink/35' onClick={onClose} />
          <motion.form
            role='dialog'
            aria-modal='true'
            aria-labelledby={titleId}
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit?.(event)
            }}
            className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px] ${
              size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-md'
            }`}
            initial={reduceMotion ? false : { y: 24, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <header className='flex items-start justify-between gap-4 border-b border-rose-soft/60 px-6 py-5'>
              <div>
                <h2 id={titleId} className='text-xl font-extrabold text-ink'>
                  {title}
                </h2>
                {description ? <p className='mt-1 text-sm text-muted'>{description}</p> : null}
              </div>
              <button type='button' className={iconButtonClass} aria-label='Đóng' onClick={onClose}>
                <Icon name='close' size={20} />
              </button>
            </header>
            <div className='flex-1 overflow-y-auto px-6 py-5'>{children}</div>
            {footer ? (
              <footer className='flex flex-col-reverse gap-2 border-t border-rose-soft/60 px-6 py-4 sm:flex-row sm:justify-end'>
                {footer}
              </footer>
            ) : null}
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export interface FieldProps {
  readonly label: string
  readonly hint?: string
  readonly error?: string
  readonly required?: boolean
  readonly className?: string
  readonly children: (id: string) => ReactNode
}

export function Field({ label, hint, error, required, className = '', children }: FieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className='mb-1.5 block text-xs font-bold tracking-wide text-ink'>
        {label}
        {required ? <span className='ml-0.5 text-clinic'>*</span> : null}
      </label>
      {children(id)}
      {error ? (
        <p className='mt-1 text-xs text-clinic'>{error}</p>
      ) : hint ? (
        <p className='mt-1 text-xs text-muted'>{hint}</p>
      ) : null}
    </div>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange
}: {
  readonly label: string
  readonly description?: string
  readonly checked: boolean
  readonly onChange: (value: boolean) => void
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className='flex w-full items-center justify-between gap-3 rounded-2xl border border-rose-soft bg-white px-4 py-3 text-left transition hover:border-clinic/60'
    >
      <span>
        <span className='block text-sm font-semibold text-ink'>{label}</span>
        {description ? <span className='block text-xs text-muted'>{description}</span> : null}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-clinic' : 'bg-rose-soft'}`}>
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}

export const formLanguages = [
  { code: 'vi', label: 'Tiếng Việt', suffix: 'Vietnamese' },
  { code: 'en', label: 'English', suffix: 'English' },
  { code: 'km', label: 'ភាសាខ្មែរ', suffix: 'Cambodia' }
] as const

export type FormLanguage = (typeof formLanguages)[number]

export function LanguageTabs({
  value,
  onChange,
  missing = []
}: {
  readonly value: FormLanguage['code']
  readonly onChange: (code: FormLanguage['code']) => void
  readonly missing?: readonly FormLanguage['code'][]
}) {
  return (
    <div
      role='tablist'
      aria-label='Ngôn ngữ nội dung'
      className='inline-flex rounded-full border border-rose-soft bg-mist p-1'
    >
      {formLanguages.map((language) => {
        const active = language.code === value
        return (
          <button
            key={language.code}
            type='button'
            role='tab'
            aria-selected={active}
            onClick={() => onChange(language.code)}
            className={`relative rounded-full px-4 py-1.5 text-xs font-bold transition ${
              active ? 'bg-white text-clinic-deep shadow-sm' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {language.label}
            {missing.includes(language.code) ? (
              <span className='absolute top-1 right-1.5 size-1.5 rounded-full bg-clinic' aria-label='Có lỗi' />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onClose
}: {
  readonly open: boolean
  readonly title: string
  readonly message: ReactNode
  readonly confirmLabel: string
  readonly busy: boolean
  readonly error?: string
  readonly onConfirm: () => void
  readonly onClose: () => void
}) {
  return (
    <PortalDialog
      open={open}
      title={title}
      size='md'
      onClose={onClose}
      onSubmit={onConfirm}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={`${primaryButtonClass} bg-red-600 hover:bg-red-700`} disabled={busy}>
            <Icon name='delete' size={18} />
            {busy ? 'Đang xóa...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className='text-sm leading-6 text-ink/80'>{message}</div>
      {error ? <p className='mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p> : null}
    </PortalDialog>
  )
}

export function FormError({ message }: { readonly message?: string }) {
  if (!message) return null
  return (
    <p role='alert' className='mb-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>
      <Icon name='error' size={18} className='mt-0.5 shrink-0' />
      {message}
    </p>
  )
}
