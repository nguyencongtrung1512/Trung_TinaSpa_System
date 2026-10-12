import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { Pagination } from '~/components/ui/Pagination'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { ConfirmDialog, inputClass, outlineButtonClass, primaryButtonClass } from '../services/form-ui'
import { ProductCategoryFormDialog } from './ProductCategoryFormDialog'
import { ProductCategoryPanel } from './ProductCategoryPanel'
import { ProductFormDialog } from './ProductFormDialog'
import { ProductTable } from './ProductTable'
import { productApi, type Product, type ProductCategory, type ProductPage } from './product.api'

type StatusFilter = 'all' | 'ACTIVE' | 'INACTIVE'

interface FormState<T> {
  readonly session: number
  readonly open: boolean
  readonly target: T | null
}

type DeleteTarget =
  | { readonly kind: 'category'; readonly item: ProductCategory }
  | { readonly kind: 'product'; readonly item: Product }

const closedForm = { session: 0, open: false, target: null }

const PAGE_SIZE = 10

export function ProductManagementPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
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
  const [categoryForm, setCategoryForm] = useState<FormState<ProductCategory>>(closedForm)
  const [productForm, setProductForm] = useState<FormState<Product>>(closedForm)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string>()
  const [togglingID, setTogglingID] = useState<string | null>(null)
  const [notice, setNotice] = useState<string>()
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

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
    return () => clearTimeout(noticeTimer.current)
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

  const showNotice = (message: string) => {
    setNotice(message)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(undefined), 3500)
  }

  const selectedCategory = categories.find((category) => category.productCategoryID === selectedID)

  const totalProducts = categories.reduce((sum, category) => sum + category.productCount, 0)

  const openCategoryForm = (target: ProductCategory | null) =>
    setCategoryForm((current) => ({ session: current.session + 1, open: true, target }))
  const openProductForm = (target: Product | null) =>
    setProductForm((current) => ({ session: current.session + 1, open: true, target }))
  const closeCategoryForm = useCallback(() => setCategoryForm((current) => ({ ...current, open: false })), [])
  const closeProductForm = useCallback(() => setProductForm((current) => ({ ...current, open: false })), [])
  const closeDelete = useCallback(() => setDeleteTarget(null), [])

  /** The list payload has no details, so editing loads the full product first. */
  async function editProduct(product: Product) {
    try {
      openProductForm(await productApi.getProduct(product.productID))
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Không tải được sản phẩm.')
    }
  }

  const handleSaved = (close: () => void) => (message: string) => {
    close()
    showNotice(message)
    reload()
  }

  const askDelete = (target: DeleteTarget) => {
    setDeleteError(undefined)
    setDeleteTarget(target)
  }

  async function confirmDelete() {
    if (!deleteTarget || (deleteTarget.kind === 'category' && deleteTarget.item.productCount > 0)) return
    setDeleteBusy(true)
    setDeleteError(undefined)
    try {
      if (deleteTarget.kind === 'category') {
        await productApi.removeCategory(deleteTarget.item.productCategoryID)
        if (selectedID === deleteTarget.item.productCategoryID) {
          setSelectedID('all')
          setPage(1)
        }
      } else {
        await productApi.removeProduct(deleteTarget.item.productID)
      }
      showNotice(`Đã xóa "${deleteTarget.item.nameVietnamese}".`)
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
      showNotice(`${product.nameVietnamese}: ${status === 'ACTIVE' ? 'đã mở bán lại' : 'đã tạm ẩn'}.`)
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Không đổi được trạng thái.')
    } finally {
      setTogglingID(null)
    }
  }

  const blockedCategory = deleteTarget?.kind === 'category' && deleteTarget.item.productCount > 0

  const deleteMessage = (() => {
    if (!deleteTarget) return null
    if (deleteTarget.kind === 'product') {
      return (
        <p>
          Sản phẩm <strong>{deleteTarget.item.nameVietnamese}</strong> sẽ bị gỡ khỏi website và trang quản lý.
        </p>
      )
    }
    return deleteTarget.item.productCount > 0 ? (
      <p>
        Danh mục <strong>{deleteTarget.item.nameVietnamese}</strong> đang có{' '}
        <strong>{deleteTarget.item.productCount} sản phẩm</strong>. Chỉ xóa được danh mục khi không còn sản phẩm nào: hãy
        xóa hoặc chuyển các sản phẩm sang danh mục khác trước.
      </p>
    ) : (
      <p>
        Danh mục <strong>{deleteTarget.item.nameVietnamese}</strong> sẽ bị xóa vĩnh viễn.
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
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Sản phẩm</h1>
          <p className='mt-1 text-sm text-muted'>Quản lý danh mục và sản phẩm hiển thị trên trang Sản phẩm của website.</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button type='button' className={outlineButtonClass} onClick={() => openCategoryForm(null)}>
            <Icon name='create_new_folder' size={18} />
            Thêm danh mục
          </button>
          <button
            type='button'
            className={primaryButtonClass}
            onClick={() => openProductForm(null)}
            disabled={categories.length === 0}
          >
            <Icon name='add' size={18} />
            Thêm sản phẩm
          </button>
        </div>
      </header>

      <ul className='mt-6 grid gap-3 sm:grid-cols-4'>
        {[
          { label: 'Danh mục', value: categories.length, icon: 'category' },
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
        <div className='mt-6 grid items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]'>
          <div className='xl:sticky xl:top-24'>
            {metaLoading ? (
              <div className={`${portalCardClass} h-80 animate-pulse`} />
            ) : (
              <ProductCategoryPanel
                categories={categories}
                totalProducts={totalProducts}
                selectedID={selectedID}
                onSelect={(id) => {
                  setSelectedID(id)
                  setPage(1)
                }}
                onEdit={openCategoryForm}
                onDelete={(item) => askDelete({ kind: 'category', item })}
              />
            )}
          </div>

          <section className={`${portalCardClass} p-3 sm:p-4`} aria-label='Danh sách sản phẩm'>
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
              <select
                aria-label='Lọc trạng thái'
                className={`${inputClass} sm:w-40`}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as StatusFilter)
                  setPage(1)
                }}
              >
                <option value='all'>Mọi trạng thái</option>
                <option value='ACTIVE'>Đang bán</option>
                <option value='INACTIVE'>Tạm ẩn</option>
              </select>
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
                togglingID={togglingID}
                onEdit={(product) => void editProduct(product)}
                onDelete={(item) => askDelete({ kind: 'product', item })}
                onToggleStatus={(product) => void toggleStatus(product)}
              />
            ) : (
              <div className='flex flex-col items-center gap-3 px-6 py-14 text-center'>
                <Icon name='inventory_2' size={32} className='text-clinic/60' />
                <p className='text-sm text-muted'>
                  {totalProducts === 0 ? 'Chưa có sản phẩm nào.' : 'Không có sản phẩm khớp bộ lọc.'}
                </p>
                {categories.length > 0 ? (
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
        </div>
      )}

      <ProductCategoryFormDialog
        key={`category-${categoryForm.session}`}
        open={categoryForm.open}
        category={categoryForm.target}
        nextOrder={categories.reduce((max, category) => Math.max(max, category.displayOrder), 0) + 1}
        onClose={closeCategoryForm}
        onSaved={handleSaved(closeCategoryForm)}
      />
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
        title={deleteTarget?.kind === 'category' ? 'Xóa danh mục sản phẩm?' : 'Xóa sản phẩm?'}
        message={deleteMessage}
        confirmLabel={blockedCategory ? 'Đã hiểu' : 'Xóa'}
        busy={deleteBusy}
        error={deleteError}
        onConfirm={() => (blockedCategory ? closeDelete() : void confirmDelete())}
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
