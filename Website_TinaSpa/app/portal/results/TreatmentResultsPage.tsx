import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ActionMenu } from '~/components/ui/ActionMenu'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { treatmentResultsApi, type TreatmentResult } from '~/lib/treatment-results'
import { formatPortalDate } from '~/portal/format'
import { ConfirmDialog, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { TreatmentResultDialog } from './TreatmentResultDialog'

/** Quản trị và quản lý thêm/sửa/ẩn/xóa kết quả thực tế trên trang chủ (khớp quyền ở backend). */
export function TreatmentResultsPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const [results, setResults] = useState<TreatmentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [form, setForm] = useState<{ session: number; open: boolean; target?: TreatmentResult }>({
    session: 0,
    open: false
  })
  const [deleteTarget, setDeleteTarget] = useState<TreatmentResult | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setResults(await treatmentResultsApi.listForManage())
      setLoadError(undefined)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách kết quả.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openForm = (target?: TreatmentResult) =>
    setForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])

  async function toggleActive(result: TreatmentResult) {
    try {
      await treatmentResultsApi.update(result.treatmentResultID, { isActive: !result.isActive })
      toast.success(`${result.titleVietnamese}: ${result.isActive ? 'đã ẩn khỏi trang chủ' : 'đã hiển thị lại'}.`)
      void refresh()
    } catch (error) {
      toast.error('Không đổi được trạng thái', error instanceof Error ? error.message : undefined)
    }
  }

  const closeDelete = useCallback(() => {
    setDeleteTarget(null)
    setDeleteError(undefined)
  }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      await treatmentResultsApi.remove(deleteTarget.treatmentResultID)
      toast.success(`Đã xóa kết quả "${deleteTarget.titleVietnamese}".`)
      setDeleteTarget(null)
      void refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa kết quả.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const visibleCount = results.filter((result) => result.isActive).length
  const nextOrder = results.reduce((max, result) => Math.max(max, result.displayOrder), 0) + 1

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel[role]}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Kết quả thực tế</h1>
          <p className='mt-1 text-sm text-muted'>
            {results.length > 0
              ? `${results.length} kết quả · ${visibleCount} đang hiển thị trên trang chủ.`
              : 'Ảnh trước/sau của khách hàng hiển thị ở mục "Kết quả thực tế" trên trang chủ.'}
          </p>
        </div>
        <button type='button' className={`${primaryButtonClass} self-start lg:self-auto`} onClick={() => openForm()}>
          <Icon name='add' size={18} />
          Thêm kết quả
        </button>
      </header>

      {loadError ? (
        <section className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='cloud_off' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{loadError}</p>
          <button type='button' className={outlineButtonClass} onClick={() => void refresh()}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </section>
      ) : loading ? (
        <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {[0, 1, 2].map((item) => (
            <div key={item} className={`${portalCardClass} h-80 animate-pulse`} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <section className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='compare' size={32} className='text-clinic/60' />
          <p className='text-sm text-muted'>Chưa có kết quả nào. Mục "Kết quả thực tế" đang ẩn trên trang chủ.</p>
          <button type='button' className={outlineButtonClass} onClick={() => openForm()}>
            <Icon name='add' size={18} />
            Thêm kết quả
          </button>
        </section>
      ) : (
        <ul className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3' aria-label='Danh sách kết quả thực tế'>
          {results.map((result) => (
            <li
              key={result.treatmentResultID}
              className={`${portalCardClass} flex flex-col overflow-hidden p-3 transition ${result.isActive ? '' : 'opacity-70'}`}
            >
              <button
                type='button'
                className='grid grid-cols-2 gap-1 overflow-hidden rounded-2xl bg-mist text-left'
                aria-label={`Chỉnh sửa ${result.titleVietnamese}`}
                onClick={() => openForm(result)}
              >
                {(
                  [
                    ['Before', result.beforeImage],
                    ['After', result.afterImage]
                  ] as const
                ).map(([label, src]) => (
                  <span key={label} className='relative aspect-[4/5]'>
                    <img src={src} alt='' className='size-full object-cover' loading='lazy' />
                    <span
                      className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase ${
                        label === 'Before' ? 'bg-ink/70' : 'bg-clinic'
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                ))}
              </button>

              <div className='flex flex-1 flex-col px-2 pt-4 pb-1'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>
                      Thứ tự {result.displayOrder}
                    </p>
                    <h2 className='mt-0.5 font-extrabold text-ink'>{result.titleVietnamese}</h2>
                  </div>
                  <ActionMenu
                    label={`Thao tác với ${result.titleVietnamese}`}
                    items={[
                      { label: 'Chỉnh sửa', icon: 'edit', onSelect: () => openForm(result) },
                      {
                        label: result.isActive ? 'Ẩn khỏi trang chủ' : 'Hiển thị lại',
                        icon: result.isActive ? 'visibility_off' : 'visibility',
                        onSelect: () => void toggleActive(result)
                      },
                      {
                        label: 'Xóa',
                        icon: 'delete',
                        tone: 'danger',
                        onSelect: () => {
                          setDeleteError(undefined)
                          setDeleteTarget(result)
                        }
                      }
                    ]}
                  />
                </div>
                <p className='mt-1 text-sm font-semibold text-clinic'>{result.resultVietnamese}</p>
                {result.summaryVietnamese ? (
                  <p className='mt-0.5 line-clamp-2 text-xs text-muted'>{result.summaryVietnamese}</p>
                ) : null}

                <div className='flex-1' />
                <div className='mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-rose-soft/60 pt-3'>
                  <p className='text-xs text-ink/80'>
                    <span className='font-bold'>{result.sessionCount}</span> buổi ·{' '}
                    <span className='font-bold'>{result.durationWeeks}</span> tuần
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                      result.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${result.isActive ? 'bg-emerald-500' : 'bg-muted'}`} />
                    {result.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TreatmentResultDialog
        key={form.session}
        open={form.open}
        result={form.target}
        nextOrder={nextOrder}
        onClose={closeForm}
        onSaved={(message) => {
          closeForm()
          toast.success(message)
          void refresh()
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title='Xóa kết quả?'
        message={
          <>
            Kết quả <strong>{deleteTarget?.titleVietnamese}</strong> sẽ bị xóa vĩnh viễn. Nếu chỉ muốn tạm ẩn, hãy chọn
            &quot;Ẩn khỏi trang chủ&quot;.
          </>
        }
        confirmLabel='Xóa'
        icon='delete'
        tone='danger'
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={closeDelete}
      />
    </motion.div>
  )
}
