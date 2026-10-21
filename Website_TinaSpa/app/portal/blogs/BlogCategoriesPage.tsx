import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ActionMenu } from '~/components/ui/ActionMenu'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { formatPortalDate } from '~/portal/format'
import { ConfirmDialog, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { blogApi, type BlogCategory } from './blog.api'
import { CategoryDialog } from './CategoryDialog'

/** Quản lý thêm/sửa/ẩn/xóa danh mục; quản trị và nhân viên chỉ xem (khớp quyền ở backend). */
export function BlogCategoriesPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const canWrite = role === 'manager'
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [form, setForm] = useState<{ session: number; open: boolean; target?: BlogCategory }>({
    session: 0,
    open: false
  })
  const [deleteTarget, setDeleteTarget] = useState<BlogCategory | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setCategories(await blogApi.listCategories())
      setLoadError(undefined)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh mục bài viết.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openForm = (target?: BlogCategory) =>
    setForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])

  async function toggleActive(category: BlogCategory) {
    try {
      await blogApi.updateCategory(category.blogCategoryID, { isActive: !category.isActive })
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
      await blogApi.removeCategory(deleteTarget.blogCategoryID)
      toast.success(`Đã xóa danh mục "${deleteTarget.nameVietnamese}".`)
      setDeleteTarget(null)
      void refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa danh mục.')
    } finally {
      setDeleteBusy(false)
    }
  }

  const deleteBlocked = (deleteTarget?.blogCount ?? 0) > 0
  const totalPosts = categories.reduce((sum, category) => sum + category.blogCount, 0)

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
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Danh mục bài viết</h1>
          <p className='mt-1 text-sm text-muted'>
            {categories.length > 0
              ? `${categories.length} danh mục · ${totalPosts} bài viết.`
              : 'Nhóm bài viết theo chủ đề để khách dễ tìm trên trang Blog.'}
            {canWrite ? '' : ' Chỉ quản lý được thêm và chỉnh sửa danh mục.'}
          </p>
        </div>
        {canWrite ? (
          <button type='button' className={`${primaryButtonClass} self-start lg:self-auto`} onClick={() => openForm()}>
            <Icon name='add' size={18} />
            Thêm danh mục
          </button>
        ) : null}
      </header>

      <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label='Danh sách danh mục bài viết'>
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
            {canWrite ? (
              <button type='button' className={outlineButtonClass} onClick={() => openForm()}>
                <Icon name='add' size={18} />
                Thêm danh mục
              </button>
            ) : null}
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
                    Bài viết
                  </th>
                  <th scope='col' className='px-4 py-3 text-right'>
                    Thứ tự
                  </th>
                  <th scope='col' className='px-4 py-3'>
                    Trạng thái
                  </th>
                  {canWrite ? (
                    <th scope='col' className='w-14 px-2 py-3'>
                      <span className='sr-only'>Thao tác</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.blogCategoryID}
                    className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'
                  >
                    <td className='max-w-[420px] px-4 py-3'>
                      <p className='font-bold text-ink'>{category.nameVietnamese}</p>
                      <p className='font-mono text-[11px] text-muted/80'>/{category.slug}</p>
                      {category.description ? (
                        <p className='mt-0.5 truncate text-xs text-muted' title={category.description}>
                          {category.description}
                        </p>
                      ) : null}
                    </td>
                    <td className='px-4 py-3 text-right font-semibold text-ink/80 tabular-nums'>
                      {category.blogCount}
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
                    {canWrite ? (
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
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canWrite ? (
        <CategoryDialog
          key={form.session}
          open={form.open}
          category={form.target}
          onClose={closeForm}
          onSaved={(message) => {
            closeForm()
            toast.success(message)
            void refresh()
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteBlocked ? 'Chưa thể xóa danh mục' : 'Xóa danh mục?'}
        message={
          deleteBlocked ? (
            <>
              <strong>{deleteTarget?.nameVietnamese}</strong> còn {deleteTarget?.blogCount} bài viết. Hãy chuyển các bài
              sang danh mục khác trước, hoặc chọn &quot;Ẩn khỏi website&quot;.
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
