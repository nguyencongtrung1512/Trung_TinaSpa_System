import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { catalogApi, toSlug, type CatalogCategory, type CatalogService } from './catalog.api'
import { ConfirmDialog, inputClass, outlineButtonClass, primaryButtonClass } from './form-ui'
import { ServiceFormDialog } from './ServiceFormDialog'
import { ServiceTable } from './ServiceTable'
import { Select } from '~/components/ui/Select'

type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE'

interface FormState<T> {
  readonly session: number
  readonly open: boolean
  readonly target: T | null
}

const closedForm = { session: 0, open: false, target: null }

const normalize = (value: string | null | undefined) => toSlug(value ?? '').replaceAll('-', ' ')

/** Dịch vụ & giá; nhóm dịch vụ được quản lý ở trang Danh mục dịch vụ. */
export function ServiceCatalogPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [services, setServices] = useState<CatalogService[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [selectedID, setSelectedID] = useState('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [serviceForm, setServiceForm] = useState<FormState<CatalogService>>(closedForm)
  const [deleteTarget, setDeleteTarget] = useState<CatalogService | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [togglingID, setTogglingID] = useState<string | null>(null)
  const toast = useToast()

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
  }, [refresh])

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

  const openServiceForm = (target: CatalogService | null) =>
    setServiceForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeServiceForm = useCallback(() => setServiceForm((current) => ({ ...current, open: false })), [])
  const closeDelete = useCallback(() => setDeleteTarget(null), [])

  const handleSaved = (close: () => void) => (message: string) => {
    close()
    toast.success(message)
    void refresh()
  }

  const askDelete = (target: CatalogService) => {
    setDeleteError(undefined)
    setDeleteTarget(target)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      await catalogApi.removeService(deleteTarget.serviceID)
      toast.success(`Đã xóa "${deleteTarget.nameVietnamese}".`)
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
      toast.success(`${service.nameVietnamese}: ${status === 'ACTIVE' ? 'đã mở lại' : 'đã tạm ẩn'}.`)
    } catch (error) {
      toast.error('Không đổi được trạng thái', error instanceof Error ? error.message : undefined)
    } finally {
      setTogglingID(null)
    }
  }

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
          <p className='mt-1 text-sm text-muted'>Giá và thời lượng dịch vụ hiển thị trên website và form đặt lịch.</p>
        </div>
        <button
          type='button'
          className={`${primaryButtonClass} self-start lg:self-auto`}
          onClick={() => openServiceForm(null)}
          disabled={categories.length === 0}
          title={categories.length === 0 ? 'Cần tạo nhóm dịch vụ trước' : undefined}
        >
          <Icon name='add' size={18} />
          Thêm dịch vụ
        </button>
      </header>

      <ul className='mt-6 grid gap-3 sm:grid-cols-3'>
        {[
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
        <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label='Danh sách dịch vụ'>
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
            <Select
              aria-label='Lọc nhóm dịch vụ'
              className='w-full sm:w-52'
              value={selectedID}
              onChange={setSelectedID}
              options={[
                { value: 'all', label: 'Mọi nhóm dịch vụ' },
                ...categories.map((category) => ({
                  value: category.serviceCategoryID,
                  label: category.nameVietnamese
                }))
              ]}
            />
            <Select
              aria-label='Lọc trạng thái'
              className='w-full sm:w-40'
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Mọi trạng thái' },
                { value: 'ACTIVE', label: 'Đang mở' },
                { value: 'INACTIVE', label: 'Tạm ẩn' }
              ]}
            />
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
              onDelete={askDelete}
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
      )}

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
        title='Xóa dịch vụ?'
        message={
          <p>
            Dịch vụ <strong>{deleteTarget?.nameVietnamese}</strong> sẽ bị ẩn khỏi website và trang quản lý. Dữ liệu vẫn
            được lưu để đối chiếu lịch hẹn cũ.
          </p>
        }
        confirmLabel='Xóa'
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onClose={closeDelete}
      />
    </motion.div>
  )
}
