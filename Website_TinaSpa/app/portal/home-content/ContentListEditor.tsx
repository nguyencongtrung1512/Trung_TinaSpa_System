import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { FormError, iconButtonClass, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { portalCardClass } from '~/portal/styles'

export type RowErrors<T> = Partial<Record<keyof T, string>>

interface Row<T> {
  readonly key: number
  readonly value: T
}

export interface ContentListEditorProps<T> {
  readonly title: string
  readonly description: string
  readonly icon: string
  /** Singular label for one row, e.g. "Thành viên". */
  readonly itemLabel: string
  readonly max: number
  readonly load: () => Promise<readonly T[]>
  readonly save: (items: readonly T[]) => Promise<readonly T[]>
  readonly blank: () => T
  readonly validate: (item: T) => RowErrors<T>
  readonly renderRow: (props: {
    readonly item: T
    readonly errors: RowErrors<T>
    readonly update: <K extends keyof T>(field: K, value: T[K]) => void
    readonly onUploadingChange: (uploading: boolean) => void
  }) => ReactNode
}

/** Loads a list, lets the admin add / remove / reorder / edit rows, and saves the whole list at once. */
export function ContentListEditor<T>({
  title,
  description,
  icon,
  itemLabel,
  max,
  load,
  save,
  blank,
  validate,
  renderRow
}: ContentListEditorProps<T>) {
  const toast = useToast()
  const reduceMotion = useReducedMotion()
  const nextKey = useRef(0)
  const [rows, setRows] = useState<Row<T>[]>()
  const [saved, setSaved] = useState('')
  const [errors, setErrors] = useState<Record<number, RowErrors<T>>>({})
  const [loadError, setLoadError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [uploads, setUploads] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)

  const toRows = (items: readonly T[]) => items.map((value) => ({ key: nextKey.current++, value }))

  useEffect(() => {
    let cancelled = false
    setLoadError(undefined)
    load()
      .then((items) => {
        if (cancelled) return
        setRows(toRows(items))
        setSaved(JSON.stringify(items))
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được nội dung.')
      })
    return () => {
      cancelled = true
    }
    // `load` is a stable api function; reloadKey re-runs it on "Thử lại".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])

  const dirty = rows !== undefined && JSON.stringify(rows.map((row) => row.value)) !== saved

  function updateRow(key: number, field: keyof T, value: T[keyof T]) {
    setRows((current) =>
      current?.map((row) => (row.key === key ? { ...row, value: { ...row.value, [field]: value } } : row))
    )
    setErrors((current) => ({ ...current, [key]: { ...current[key], [field]: undefined } }))
  }

  function move(index: number, delta: number) {
    setRows((current) => {
      if (!current) return current
      const next = [...current]
      const [row] = next.splice(index, 1)
      next.splice(index + delta, 0, row)
      return next
    })
  }

  async function submit() {
    if (!rows || uploads > 0) return
    const nextErrors = Object.fromEntries(rows.map((row) => [row.key, validate(row.value)]))
    setErrors(nextErrors)
    if (Object.values(nextErrors).some((rowErrors) => Object.values(rowErrors).some(Boolean))) {
      setSubmitError('Vui lòng kiểm tra lại các ô được đánh dấu.')
      return
    }
    setBusy(true)
    setSubmitError(undefined)
    try {
      const items = await save(rows.map((row) => row.value))
      setRows(toRows(items))
      setSaved(JSON.stringify(items))
      setErrors({})
      toast.success(`Đã lưu "${title}". Trang chủ đã được cập nhật.`)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không lưu được nội dung.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className={`${portalCardClass} p-5 sm:p-6`} aria-label={title}>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-4'>
          <span className='grid size-11 shrink-0 place-items-center rounded-2xl bg-mist text-clinic'>
            <Icon name={icon} size={22} />
          </span>
          <div>
            <h2 className='text-lg font-extrabold text-ink'>{title}</h2>
            <p className='text-sm text-muted'>{description}</p>
          </div>
        </div>
        {rows ? (
          <span className='shrink-0 self-start rounded-full bg-mist px-3 py-1 text-xs font-bold text-clinic'>
            {rows.length}/{max} {itemLabel.toLowerCase()}
          </span>
        ) : null}
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
      ) : !rows ? (
        <div className='mt-6 h-64 animate-pulse rounded-2xl bg-canvas' />
      ) : (
        <>
          <ol className='mt-6 space-y-4'>
            <AnimatePresence initial={false}>
              {rows.map((row, index) => (
                <motion.li
                  key={row.key}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className='rounded-2xl border border-rose-soft/60 bg-canvas/50 p-4'
                >
                  <div className='mb-3 flex items-center justify-between gap-2'>
                    <p className='flex items-center gap-2 text-sm font-extrabold text-ink'>
                      <span className='grid size-7 place-items-center rounded-full bg-clinic text-xs text-white tabular-nums'>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {itemLabel} {index + 1}
                    </p>
                    <div className='flex items-center'>
                      <button
                        type='button'
                        className={`${iconButtonClass} disabled:opacity-30`}
                        aria-label={`Đưa ${itemLabel.toLowerCase()} ${index + 1} lên trước`}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <Icon name='arrow_upward' size={18} />
                      </button>
                      <button
                        type='button'
                        className={`${iconButtonClass} disabled:opacity-30`}
                        aria-label={`Đưa ${itemLabel.toLowerCase()} ${index + 1} xuống sau`}
                        disabled={index === rows.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <Icon name='arrow_downward' size={18} />
                      </button>
                      <button
                        type='button'
                        className={`${iconButtonClass} hover:text-red-600 disabled:opacity-30`}
                        aria-label={`Xóa ${itemLabel.toLowerCase()} ${index + 1}`}
                        disabled={rows.length === 1}
                        onClick={() => setRows((current) => current?.filter((entry) => entry.key !== row.key))}
                      >
                        <Icon name='delete' size={18} />
                      </button>
                    </div>
                  </div>
                  {renderRow({
                    item: row.value,
                    errors: errors[row.key] ?? {},
                    update: (field, value) => updateRow(row.key, field, value),
                    onUploadingChange: (uploading) => setUploads((count) => Math.max(0, count + (uploading ? 1 : -1)))
                  })}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          <div className='mt-4'>
            <FormError message={submitError} />
          </div>
          <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <button
              type='button'
              className={outlineButtonClass}
              disabled={rows.length >= max}
              onClick={() => setRows((current) => [...(current ?? []), { key: nextKey.current++, value: blank() }])}
            >
              <Icon name='add' size={18} />
              Thêm {itemLabel.toLowerCase()}
            </button>
            <div className='flex items-center gap-3'>
              {dirty ? <span className='text-xs font-semibold text-amber-700'>Có thay đổi chưa lưu</span> : null}
              <button
                type='button'
                className={primaryButtonClass}
                disabled={busy || uploads > 0 || !dirty}
                onClick={() => void submit()}
              >
                <Icon name='save' size={18} />
                {busy ? 'Đang lưu...' : uploads > 0 ? 'Đang tải ảnh...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
