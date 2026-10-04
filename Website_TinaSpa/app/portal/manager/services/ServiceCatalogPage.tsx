import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { catalogApi, toSlug, type CatalogCategory, type CatalogService } from './catalog.api'
import { CategoryFormDialog } from './CategoryFormDialog'
import { CategoryPanel } from './CategoryPanel'
import { ConfirmDialog, inputClass, outlineButtonClass, primaryButtonClass } from './form-ui'
import { ServiceFormDialog } from './ServiceFormDialog'
import { ServiceTable } from './ServiceTable'

type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE'

interface FormState<T> {
  readonly session: number
  readonly open: boolean
  readonly target: T | null
}

type DeleteTarget =
  | { readonly kind: 'category'; readonly item: CatalogCategory }
  | { readonly kind: 'service'; readonly item: CatalogService }

const closedForm = { session: 0, open: false, target: null }

const normalize = (value: string | null | undefined) => toSlug(value ?? '').replaceAll('-', ' ')

export function ServiceCatalogPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [services, setServices] = useState<CatalogService[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [selectedID, setSelectedID] = useState('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryForm, setCategoryForm] = useState<FormState<CatalogCategory>>(closedForm)
  const [serviceForm, setServiceForm] = useState<FormState<CatalogService>>(closedForm)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [togglingID, setTogglingID] = useState<string | null>(null)
  const [notice, setNotice] = useState<string>()
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const refresh = useCallback(async () => {
    try {
      const [nextCategories, nextServices] = await Promise.all([catalogApi.listCategories(), catalogApi.listServices()])
      setCategories(nextCategories)
      setServices(nextServices)
      setLoadError(undefined)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh mục dịch vụ.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    return () => clearTimeout(noticeTimer.current)
  }, [refresh])

  const showNotice = (message: string) => {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(undefined), 3500)
  }

  const selectedCategory = categories.find((category) => category.serviceCategoryID === selectedID)

  const visibleServices = useMemo(() => {
    const query = normalize(search.trim())
    return services.filter((service) => {
      if (selectedID !== 'all' && service.category?.serviceCategoryID !== selectedID) return false
      if (statusFilter !== 'all' && service.status !== statusFilter) return false
      if (!query) return true
      return [service.nameVietnamese, service.nameEnglish, service.slug, service.shortDescriptionVietnamese].some(
        (value) => normalize(value).includes(query)
      )
    })
  }, [services, selectedID, statusFilter, search])

  const activeCount = services.filter((service) => service.status === 'ACTIVE').length

  const openCategoryForm = (target: CatalogCategory | null) =>
    setCategoryForm((current) => ({ session: current.session + 1, open: true, target }))
  const openServiceForm = (target: CatalogService | null) =>
    setServiceForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeCategoryForm = useCallback(() => setCategoryForm((current) => ({ ...current, open: false })), [])
  const closeServiceForm = useCallback(() => setServiceForm((current) => ({ ...current, open: false })), [])
  const closeDelete = useCallback(() => setDeleteTarget(null), [])

  const handleSaved = (close: () => void) => (message: string) => {
    close()
    showNotice(message)
    void refresh()
  }

  const askDelete = (target: DeleteTarget) => {
    setDeleteError(undefined)
    setDeleteTarget(target)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      if (deleteTarget.kind === 'category') {
        await catalogApi.removeCategory(deleteTarget.item.serviceCategoryID)
        if (selectedID === deleteTarget.item.serviceCategoryID) setSelectedID('all')
      } else {
        await catalogApi.removeService(deleteTarget.item.serviceID)
      }
      showNotice(`Đã xóa "${deleteTarget.item.nameVietnamese}".`)
      setDeleteTarget(null)
      void refresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa.')
    } finally {
      setDeleteBusy(false)
    }
  }

  async function toggleStatus(service: CatalogService) {
    const status = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setTogglingID(service.serviceID)
    try {
      await catalogApi.updateService(service.serviceID, { status })
      setServices((current) =>
        current.map((item) => (item.serviceID === service.serviceID ? { ...item, status } : item))
      )
      showNotice(`${service.nameVietnamese}: ${status === 'ACTIVE' ? 'đã mở lại' : 'đã tạm ẩn'}.`)
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Không đổi được trạng thái.')
    } finally {
      setTogglingID(null)
    }
  }

  const deleteMessage = (() => {
    if (!deleteTarget) return null
    if (deleteTarget.kind === 'service') {
      return (
        <p>
          Dịch vụ <strong>{deleteTarget.item.nameVietnamese}</strong> sẽ bị ẩn khỏi website và trang quản lý. Dữ liệu
          vẫn được lưu để đối chiếu lịch hẹn cũ.
        </p>
      )
    }
    const count = deleteTarget.item.serviceCount
    return (
      <p>
        {count > 0 ? (
          <>
            Nhóm <strong>{deleteTarget.item.nameVietnamese}</strong> đang có <strong>{count} dịch vụ</strong>. Hãy xóa
            hoặc chuyển các dịch vụ sang nhóm khác trước khi xóa nhóm.
          </>
        ) : (
          <>
            Nhóm <strong>{deleteTarget.item.nameVietnamese}</strong> sẽ bị ẩn khỏi website và trang quản lý.
          </>
        )}
      </p>
    )
  })()

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
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Dịch vụ & Menu trị liệu</h1>
          <p className='mt-1 text-sm text-muted'>
            Quản lý nhóm dịch vụ, giá và thời lượng hiển thị trên website và form đặt lịch.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button type='button' className={outlineButtonClass} onClick={() => openCategoryForm(null)}>
            <Icon name='create_new_folder' size={18} />
            Thêm nhóm
          </button>
          <button
            type='button'
            className={primaryButtonClass}
            onClick={() => openServiceForm(null)}
            disabled={categories.length === 0}
          >
            <Icon name='add' size={18} />
            Thêm dịch vụ
          </button>
        </div>
      </header>

      <ul className='mt-6 grid gap-3 sm:grid-cols-4'>
        {[
          { label: 'Nhóm dịch vụ', value: categories.length, icon: 'category' },
          { label: 'Dịch vụ', value: services.length, icon: 'spa' },
          { label: 'Đang mở', value: activeCount, icon: 'visibility' },
          { label: 'Tạm ẩn', value: services.length - activeCount, icon: 'visibility_off' }
        ].map((metric) => (
          <li key={metric.label} className={`${portalCardClass} flex items-center gap-4 p-4`}>
            <span className='grid size-10 place-items-center rounded-2xl bg-mist text-clinic'>
              <Icon name={metric.icon} size={20} />
            </span>
            <div>
              <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>{metric.label}</p>
              <p className='text-2xl font-extrabold text-ink'>{loading ? '–' : metric.value}</p>
            </div>
          </li>
        ))}
      </ul>

      {loadError ? (
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-10 text-center`}>
          <Icon name='cloud_off' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{loadError}</p>
          <button
            type='button'
            className={outlineButtonClass}
            onClick={() => {
              setLoading(true)
              void refresh()
            }}
          >
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      ) : (
        <div className='mt-6 grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]'>
          <div className='xl:sticky xl:top-24'>
            {loading ? (
              <div className={`${portalCardClass} h-80 animate-pulse`} />
            ) : (
              <CategoryPanel
                categories={categories}
                totalServices={services.length}
                selectedID={selectedID}
                onSelect={setSelectedID}
                onEdit={openCategoryForm}
                onDelete={(item) => askDelete({ kind: 'category', item })}
              />
            )}
          </div>

          <section className={`${portalCardClass} p-3 sm:p-4`} aria-label='Danh sách dịch vụ'>
            <div className='flex flex-col gap-3 px-1 pb-3 sm:flex-row sm:items-center'>
              <h2 className='flex-1 text-lg font-extrabold text-ink'>
                {selectedCategory?.nameVietnamese ?? 'Tất cả dịch vụ'}
                <span className='ml-2 text-sm font-semibold text-muted'>{visibleServices.length}</span>
              </h2>
              <div className='relative sm:w-64'>
                <Icon
                  name='search'
                  size={18}
                  className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted'
                />
                <input
                  type='search'
                  aria-label='Tìm dịch vụ'
                  placeholder='Tìm tên, slug, mô tả...'
                  className={`${inputClass} pl-10`}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                aria-label='Lọc trạng thái'
                className={`${inputClass} sm:w-40`}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value='all'>Mọi trạng thái</option>
                <option value='ACTIVE'>Đang mở</option>
                <option value='INACTIVE'>Tạm ẩn</option>
              </select>
            </div>

            {loading ? (
              <div className='space-y-2 p-2'>
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className='h-16 animate-pulse rounded-2xl bg-canvas' />
                ))}
              </div>
            ) : visibleServices.length > 0 ? (
              <ServiceTable
                services={visibleServices}
                showCategory={selectedID === 'all'}
                togglingID={togglingID}
                onEdit={openServiceForm}
                onDelete={(item) => askDelete({ kind: 'service', item })}
                onToggleStatus={(service) => void toggleStatus(service)}
              />
            ) : (
              <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
                <Icon name='spa' size={32} className='text-clinic/60' />
                <p className='text-sm text-muted'>
                  {services.length === 0 ? 'Chưa có dịch vụ nào.' : 'Không có dịch vụ khớp bộ lọc.'}
                </p>
                {categories.length > 0 ? (
                  <button type='button' className={outlineButtonClass} onClick={() => openServiceForm(null)}>
                    <Icon name='add' size={18} />
                    Thêm dịch vụ
                  </button>
                ) : null}
              </div>
            )}
          </section>
        </div>
      )}

      <CategoryFormDialog
        key={`category-${categoryForm.session}`}
        open={categoryForm.open}
        category={categoryForm.target}
        nextSortOrder={categories.reduce((max, category) => Math.max(max, category.sortOrder), 0) + 1}
        onClose={closeCategoryForm}
        onSaved={handleSaved(closeCategoryForm)}
      />
      <ServiceFormDialog
        key={`service-${serviceForm.session}`}
        open={serviceForm.open}
        service={serviceForm.target}
        categories={categories}
        defaultCategoryID={selectedCategory?.serviceCategoryID ?? ''}
        onClose={closeServiceForm}
        onSaved={handleSaved(closeServiceForm)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget?.kind === 'category' ? 'Xóa nhóm dịch vụ?' : 'Xóa dịch vụ?'}
        message={deleteMessage}
        confirmLabel='Xóa'
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={closeDelete}
      />

      <AnimatePresence>
        {notice ? (
          <motion.p
            key={notice}
            role='status'
            className='fixed right-4 bottom-4 z-[60] flex max-w-sm items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-xl'
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Icon name='check_circle' size={18} className='text-emerald-300' />
            {notice}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
