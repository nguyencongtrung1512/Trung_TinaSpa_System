import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ActionMenu } from '~/components/ui/ActionMenu'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { catalogApi, formatPrice, type CatalogCategory } from './catalog.api'
import { CategoryFormDialog } from './CategoryFormDialog'
import { ConfirmDialog, outlineButtonClass, primaryButtonClass } from './form-ui'

/** Nhóm dịch vụ: quản lý và quản trị thêm/sửa/ẩn/xóa (khớp quyền ở backend). */
export function ServiceCategoriesPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [form, setForm] = useState<{ session: number; open: boolean; target: CatalogCategory | null }>({
    session: 0,
    open: false,
    target: null
  })
  const [deleteTarget, setDeleteTarget] = useState<CatalogCategory | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setCategories(await catalogApi.listCategories())
      setLoadError(undefined)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được nhóm dịch vụ.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openForm = (target: CatalogCategory | null) =>
    setForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])

  async function toggleStatus(category: CatalogCategory) {
    const status = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await catalogApi.updateCategory(category.serviceCategoryID, { status })
      toast.success(`${category.nameVietnamese}: ${status === 'ACTIVE' ? 'đã hiển thị lại' : 'đã ẩn khỏi website'}.`)
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
      await catalogApi.removeCategory(deleteTarget.serviceCategoryID)
      toast.success(`Đã xóa nhóm "${deleteTarget.nameVietnamese}".`)
      setDeleteTarget(null)
      void refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa nhóm dịch vụ.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const deleteBlocked = (deleteTarget?.serviceCount ?? 0) > 0
  const totalServices = categories.reduce((sum, category) => sum + category.serviceCount, 0)
  const nextSortOrder = categories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 1

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
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Danh mục dịch vụ</h1>
          <p className='mt-1 text-sm text-muted'>
            {categories.length > 0
              ? `${categories.length} nhóm · ${totalServices} dịch vụ.`
              : 'Nhóm dịch vụ hiển thị trên website và form đặt lịch.'}
          </p>
        </div>
        <button
          type='button'
          className={`${primaryButtonClass} self-start lg:self-auto`}
          onClick={() => openForm(null)}
        >
          <Icon name='add' size={18} />
          Thêm nhóm dịch vụ
        </button>
      </header>

      <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label='Danh sách nhóm dịch vụ'>
        {loadError ? (
          <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
            <Icon name='cloud_off' size={32} className='text-clinic' />
            <p className='text-sm text-ink'>{loadError}</p>
            <button type='button' className={outlineButtonClass} onClick={() => void refresh()}>
              <Icon name='refresh' size={18} />
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className='space-y-2 p-2'>
            {[0, 1, 2].map((row) => (
              <div key={row} className='h-14 animate-pulse rounded-2xl bg-canvas' />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
            <Icon name='category' size={32} className='text-clinic/60' />
            <p className='text-sm text-muted'>Chưa có nhóm dịch vụ nào.</p>
            <button type='button' className={outlineButtonClass} onClick={() => openForm(null)}>
              <Icon name='add' size={18} />
              Thêm nhóm dịch vụ
            </button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[640px] text-left text-sm'>
              <thead>
                <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
                  <th scope='col' className='px-4 py-3'>
                    Nhóm dịch vụ
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Dịch vụ
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Giá từ
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Thứ tự
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Trạng thái
                  </th>
                  <th scope='col' className='w-14 px-2 py-3'>
                    <span className='sr-only'>Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const active = category.status === 'ACTIVE'
                  return (
                    <tr
                      key={category.serviceCategoryID}
                      className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'
                    >
                      <td className='max-w-[420px] px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <span className='grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-canvas text-clinic'>
                            {category.image ? (
                              <img src={category.image} alt='' className='size-full object-cover' />
                            ) : (
                              <Icon name={category.icon ?? 'spa'} size={20} />
                            )}
                          </span>
                          <div className='min-w-0'>
                            <p className='flex items-center gap-1.5 font-bold text-ink'>
                              <span className='truncate'>{category.nameVietnamese}</span>
                              {category.isFeatured ? (
                                <Icon name='star' size={14} filled className='shrink-0 text-amber-500' />
                              ) : null}
                            </p>
                            <p className='font-mono text-[11px] text-muted/80'>/{category.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-right font-semibold text-ink/80 tabular-nums'>
                        {category.serviceCount}
                      </td>
                      <td className='px-4 py-3 text-right whitespace-nowrap text-ink/80 tabular-nums'>
                        {category.minPrice !== null ? formatPrice(category.minPrice) : '—'}
                      </td>
                      <td className='px-4 py-3 text-right text-ink/80 tabular-nums'>{category.sortOrder}</td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                            active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted'}`} />
                          {active ? 'Đang hiển thị' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className='px-2 py-3 text-right'>
                        <ActionMenu
                          label={`Thao tác với ${category.nameVietnamese}`}
                          items={[
                            { label: 'Chỉnh sửa', icon: 'edit', onSelect: () => openForm(category) },
                            {
                              label: active ? 'Ẩn khỏi website' : 'Hiển thị lại',
                              icon: active ? 'visibility_off' : 'visibility',
                              onSelect: () => void toggleStatus(category)
                            },
                            {
                              label: 'Xóa',
                              icon: 'delete',
                              tone: 'danger',
                              onSelect: () => {
                                setDeleteError(undefined)
                                setDeleteTarget(category)
                              }
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CategoryFormDialog
        key={form.session}
        open={form.open}
        category={form.target}
        nextSortOrder={nextSortOrder}
        onClose={closeForm}
        onSaved={(message) => {
          closeForm()
          toast.success(message)
          void refresh()
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteBlocked ? 'Chưa thể xóa nhóm dịch vụ' : 'Xóa nhóm dịch vụ?'}
        message={
          deleteBlocked ? (
            <>
              <strong>{deleteTarget?.nameVietnamese}</strong> còn {deleteTarget?.serviceCount} dịch vụ. Hãy xóa hoặc
              chuyển các dịch vụ sang nhóm khác trước, hoặc chọn &quot;Ẩn khỏi website&quot;.
            </>
          ) : (
            <>
              Nhóm <strong>{deleteTarget?.nameVietnamese}</strong> sẽ bị ẩn khỏi website và trang quản lý.
            </>
          )
        }
        confirmLabel={deleteBlocked ? 'Đã hiểu' : 'Xóa'}
        icon={deleteBlocked ? 'check' : 'delete'}
        tone={deleteBlocked ? 'primary' : 'danger'}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => (deleteBlocked ? closeDelete() : void confirmDelete())}
        onClose={closeDelete}
      />
    </motion.div>
  )
}
