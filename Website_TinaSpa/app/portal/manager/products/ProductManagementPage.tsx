import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { Pagination } from '~/components/ui/Pagination'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { ConfirmDialog, inputClass, outlineButtonClass, primaryButtonClass } from '../services/form-ui'
import { ProductFormDialog } from './ProductFormDialog'
import { ProductTable } from './ProductTable'
import { productApi, type Product, type ProductCategory, type ProductPage } from './product.api'
import { Select } from '~/components/ui/Select'

type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE'

interface FormState<T> {
  readonly session: number
  readonly open: boolean
  readonly target: T | null
}

const closedForm = { session: 0, open: false, target: null }

const PAGE_SIZE = 10

/** Quản lý và quản trị thêm/sửa/ẩn/xóa sản phẩm; nhân viên chỉ xem để tư vấn. Danh mục nằm ở trang riêng. */
export function ProductManagementPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const canManage = role !== 'staff'
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [activeTotal, setActiveTotal] = useState(0)
  const [result, setResult] = useState<ProductPage | null>(null)
  const [metaLoading, setMetaLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [selectedID, setSelectedID] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [productForm, setProductForm] = useState<FormState<Product>>(closedForm)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [togglingID, setTogglingID] = useState<string | null>(null)
  const toast = useToast()

  const products = result?.items ?? []

  /** Categories and the headline counts; independent of the current page / filters. */
  const refreshMeta = useCallback(async () => {
    try {
      const [nextCategories, active] = await Promise.all([
        productApi.listCategories(),
        productApi.listProducts({ status: 'ACTIVE', pageSize: 1 })
      ])
      setCategories(nextCategories)
      setActiveTotal(active.total)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách sản phẩm.')
    } finally {
      setMetaLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshMeta()
  }, [refreshMeta])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setListLoading(true)
    productApi
      .listProducts({
        categoryID: selectedID === 'all' ? undefined : selectedID,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch,
        page,
        pageSize: PAGE_SIZE
      })
      .then((next) => {
        if (cancelled) return
        setResult(next)
        setLoadError(undefined)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Không tải được danh sách sản phẩm.')
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedID, statusFilter, debouncedSearch, page, reloadKey])

  const reload = useCallback(() => {
    void refreshMeta()
    setReloadKey((key) => key + 1)
  }, [refreshMeta])

  const selectedCategory = categories.find((category) => category.productCategoryID === selectedID)

  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0)

  const openProductForm = (target: Product | null) =>
    setProductForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeProductForm = useCallback(() => setProductForm((current) => ({ ...current, open: false })), [])
  const closeDelete = useCallback(() => setDeleteTarget(null), [])

  /** The list payload has no details, so editing loads the full product first. */
  async function editProduct(product: Product) {
    try {
      openProductForm(await productApi.getProduct(product.productID))
    } catch (error) {
      toast.error('Không tải được sản phẩm', error instanceof Error ? error.message : undefined)
    }
  }

  const handleSaved = (close: () => void) => (message: string) => {
    close()
    toast.success(message)
    reload()
  }

  const askDelete = (target: Product) => {
    setDeleteError(undefined)
    setDeleteTarget(target)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      await productApi.removeProduct(deleteTarget.productID)
      toast.success(`Đã xóa "${deleteTarget.nameVietnamese}".`)
      setDeleteTarget(null)
      if (products.length === 1 && page > 1) setPage(page - 1)
      reload()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Không thể xóa.')
    } finally {
      setDeleteBusy(false)
    }
  }

  async function toggleStatus(product: Product) {
    const status = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setTogglingID(product.productID)
    try {
      await productApi.updateProduct(product.productID, { status })
      reload()
      toast.success(`${product.nameVietnamese}: ${status === 'ACTIVE' ? 'đã mở bán lại' : 'đã tạm ẩn'}.`)
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
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Sản phẩm</h1>
          <p className='mt-1 text-sm text-muted'>
            {canManage
              ? 'Sản phẩm hiển thị trên trang Sản phẩm của website. Bấm vào một sản phẩm để xem chi tiết.'
              : 'Sản phẩm dùng khi tư vấn và kê đơn chăm sóc tại nhà. Bấm vào một sản phẩm để xem chi tiết.'}
          </p>
        </div>
        {canManage ? (
          <button
            type='button'
            className={`${primaryButtonClass} self-start lg:self-auto`}
            onClick={() => openProductForm(null)}
            disabled={categories.length === 0}
            title={categories.length === 0 ? 'Cần tạo danh mục sản phẩm trước' : undefined}
          >
            <Icon name='add' size={18} />
            Thêm sản phẩm
          </button>
        ) : null}
      </header>

      <ul className='mt-6 grid gap-3 sm:grid-cols-3'>
        {[
          { label: 'Sản phẩm', value: totalProducts, icon: 'inventory_2' },
          { label: 'Đang bán', value: activeTotal, icon: 'visibility' },
          { label: 'Tạm ẩn', value: totalProducts - activeTotal, icon: 'visibility_off' }
        ].map((metric) => (
          <li key={metric.label} className={`${portalCardClass} flex items-center gap-4 p-4`}>
            <span className='grid size-10 place-items-center rounded-2xl bg-mist text-clinic'>
              <Icon name={metric.icon} size={20} />
            </span>
            <div>
              <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>{metric.label}</p>
              <p className='text-2xl font-extrabold text-ink'>{metaLoading ? '–' : metric.value}</p>
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
              setMetaLoading(true)
              reload()
            }}
          >
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      ) : (
        <section className={`${portalCardClass} mt-6 p-3 sm:p-4`} aria-label='Danh sách sản phẩm'>
          <div className='flex flex-col gap-3 px-1 pb-3 sm:flex-row sm:items-center'>
            <h2 className='flex-1 text-lg font-extrabold text-ink'>
              {selectedCategory?.nameVietnamese ?? 'Tất cả sản phẩm'}
              <span className='ml-2 text-sm font-semibold text-muted'>{result?.total ?? 0}</span>
            </h2>
            <div className='relative sm:w-64'>
              <Icon
                name='search'
                size={18}
                className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted'
              />
              <input
                type='search'
                aria-label='Tìm sản phẩm'
                placeholder='Tìm tên, slug, mô tả...'
                className={`${inputClass} pl-10`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select
              aria-label='Lọc danh mục'
              className='w-full sm:w-52'
              value={selectedID}
              onChange={(value) => {
                setSelectedID(value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'Mọi danh mục' },
                ...categories.map((category) => ({
                  value: category.productCategoryID,
                  label: category.nameVietnamese
                }))
              ]}
            />
            <Select
              aria-label='Lọc trạng thái'
              className='w-full sm:w-40'
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
              options={[
                { value: 'all', label: 'Mọi trạng thái' },
                { value: 'ACTIVE', label: 'Đang bán' },
                { value: 'INACTIVE', label: 'Tạm ẩn' }
              ]}
            />
          </div>

          {listLoading && !result ? (
            <div className='space-y-2 p-2'>
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className='h-16 animate-pulse rounded-2xl bg-canvas' />
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductTable
              products={products}
              showCategory={selectedID === 'all'}
              detailBasePath={`/portal/${role}/products`}
              canManage={canManage}
              togglingID={togglingID}
              onEdit={(product) => void editProduct(product)}
              onDelete={askDelete}
              onToggleStatus={(product) => void toggleStatus(product)}
            />
          ) : (
            <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
              <Icon name='inventory_2' size={32} className='text-clinic/60' />
              <p className='text-sm text-muted'>
                {totalProducts === 0 ? 'Chưa có sản phẩm nào.' : 'Không có sản phẩm khớp bộ lọc.'}
              </p>
              {canManage && categories.length > 0 ? (
                <button type='button' className={outlineButtonClass} onClick={() => openProductForm(null)}>
                  <Icon name='add' size={18} />
                  Thêm sản phẩm
                </button>
              ) : null}
            </div>
          )}
          {result ? (
            <Pagination
              className='border-t border-rose-soft/40 px-1 pt-3'
              page={page}
              pageSize={result.pageSize}
              total={result.total}
              disabled={listLoading}
              onPageChange={setPage}
              labels={{ summary: ({ from, to, total }) => `Hiển thị ${from}–${to} / ${total} sản phẩm` }}
            />
          ) : null}
        </section>
      )}

      <ProductFormDialog
        key={`product-${productForm.session}`}
        open={productForm.open}
        product={productForm.target}
        categories={categories}
        defaultCategoryID={selectedCategory?.productCategoryID ?? ''}
        onClose={closeProductForm}
        onSaved={handleSaved(closeProductForm)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title='Xóa sản phẩm?'
        message={
          <p>
            Sản phẩm <strong>{deleteTarget?.nameVietnamese}</strong> sẽ bị gỡ khỏi website và trang quản lý.
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
