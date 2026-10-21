import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ActionMenu } from '~/components/ui/ActionMenu'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { ConfirmDialog, outlineButtonClass, primaryButtonClass } from '../services/form-ui'
import { ProductCategoryFormDialog } from './ProductCategoryFormDialog'
import { productApi, type ProductCategory } from './product.api'

/** Danh mục sản phẩm: quản lý và quản trị thêm/sửa/ẩn/xóa (khớp quyền ManageProducts ở backend). */
export function ProductCategoriesPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [form, setForm] = useState<{ session: number; open: boolean; target: ProductCategory | null }>({
    session: 0,
    open: false,
    target: null
  })
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setCategories(await productApi.listCategories())
      setLoadError(undefined)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh mục sản phẩm.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openForm = (target: ProductCategory | null) =>
    setForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])

  async function toggleActive(category: ProductCategory) {
    try {
      await productApi.updateCategory(category.productCategoryID, { isActive: !category.isActive })
      toast.success(`${category.nameVietnamese}: ${category.isActive ? 'đã ẩn khỏi website' : 'đã hiển thị lại'}.`)
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
      await productApi.removeCategory(deleteTarget.productCategoryID)
      toast.success(`Đã xóa danh mục "${deleteTarget.nameVietnamese}".`)
      setDeleteTarget(null)
      void refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa danh mục.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const deleteBlocked = (deleteTarget?.productCount ?? 0) > 0
  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0)
  const nextOrder = categories.reduce((max, category) => Math.max(max, category.displayOrder), 0) + 1

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
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Danh mục sản phẩm</h1>
          <p className='mt-1 text-sm text-muted'>
            {categories.length > 0
              ? `${categories.length} danh mục · ${totalProducts} sản phẩm.`
              : 'Nhóm sản phẩm để khách dễ lọc trên trang Sản phẩm của website.'}
          </p>
        </div>
        <button
          type='button'
          className={`${primaryButtonClass} self-start lg:self-auto`}
          onClick={() => openForm(null)}
        >
          <Icon name='add' size={18} />
          Thêm danh mục
        </button>
      </header>

      <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label='Danh sách danh mục sản phẩm'>
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
            <p className='text-sm text-muted'>Chưa có danh mục nào.</p>
            <button type='button' className={outlineButtonClass} onClick={() => openForm(null)}>
              <Icon name='add' size={18} />
              Thêm danh mục
            </button>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[560px] text-left text-sm'>
              <thead>
                <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
                  <th scope='col' className='px-4 py-3'>
                    Danh mục
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Sản phẩm
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
                {categories.map((category) => (
                  <tr
                    key={category.productCategoryID}
                    className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'
                  >
                    <td className='max-w-[420px] px-4 py-3'>
                      <p className='font-bold text-ink'>{category.nameVietnamese}</p>
                      {category.nameEnglish ? <p className='text-xs text-muted'>{category.nameEnglish}</p> : null}
                      <p className='font-mono text-[11px] text-muted/80'>/{category.slug}</p>
                      {category.description ? (
                        <p className='mt-0.5 truncate text-xs text-muted' title={category.description}>
                          {category.description}
                        </p>
                      ) : null}
                    </td>
                    <td className='px-4 py-3 text-right font-semibold text-ink/80 tabular-nums'>
                      {category.productCount}
                    </td>
                    <td className='px-4 py-3 text-right text-ink/80 tabular-nums'>{category.displayOrder}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                          category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-muted'}`}
                        />
                        {category.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className='px-2 py-3 text-right'>
                      <ActionMenu
                        label={`Thao tác với ${category.nameVietnamese}`}
                        items={[
                          { label: 'Chỉnh sửa', icon: 'edit', onSelect: () => openForm(category) },
                          {
                            label: category.isActive ? 'Ẩn khỏi website' : 'Hiển thị lại',
                            icon: category.isActive ? 'visibility_off' : 'visibility',
                            onSelect: () => void toggleActive(category)
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ProductCategoryFormDialog
        key={form.session}
        open={form.open}
        category={form.target}
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
        title={deleteBlocked ? 'Chưa thể xóa danh mục' : 'Xóa danh mục?'}
        message={
          deleteBlocked ? (
            <>
              <strong>{deleteTarget?.nameVietnamese}</strong> còn {deleteTarget?.productCount} sản phẩm. Hãy xóa hoặc
              chuyển các sản phẩm sang danh mục khác trước, hoặc chọn &quot;Ẩn khỏi website&quot;.
            </>
          ) : (
            <>
              Danh mục <strong>{deleteTarget?.nameVietnamese}</strong> sẽ bị xóa vĩnh viễn.
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
