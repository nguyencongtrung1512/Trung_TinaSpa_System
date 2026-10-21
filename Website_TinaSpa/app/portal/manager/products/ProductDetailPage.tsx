import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { formatPrice } from '../services/catalog.api'
import { outlineButtonClass, primaryButtonClass } from '../services/form-ui'
import { ProductFormDialog } from './ProductFormDialog'
import {
  detailTypeMeta,
  productApi,
  type Product,
  type ProductCategory,
  type ProductDetail,
  type ProductDetailType
} from './product.api'

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section className='border-t border-rose-soft/40 pt-5'>
      <h2 className='text-sm font-bold tracking-wide text-muted uppercase'>{title}</h2>
      <div className='mt-3'>{children}</div>
    </section>
  )
}

function StatusPill({ active }: { readonly active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-ink/5 text-muted'
      }`}
    >
      <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted'}`} />
      {active ? 'Đang bán' : 'Tạm ẩn'}
    </span>
  )
}

function DetailBlock({
  type,
  details
}: {
  readonly type: ProductDetailType
  readonly details: readonly ProductDetail[]
}) {
  switch (type) {
    case 'STORY':
      return (
        <div className='space-y-3'>
          {details.map((detail) => (
            <p key={detail.sortOrder} className='text-sm leading-7 whitespace-pre-line text-ink/80'>
              {detail.contentVietnamese}
            </p>
          ))}
        </div>
      )
    case 'EFFECT':
      return (
        <ul className='grid gap-3 sm:grid-cols-2'>
          {details.map((detail) => (
            <li key={detail.sortOrder} className='flex gap-3 rounded-2xl bg-canvas px-4 py-3'>
              <span className='grid size-9 shrink-0 place-items-center rounded-xl bg-white text-clinic shadow-sm'>
                <Icon name={detail.icon || 'spa'} size={18} />
              </span>
              <span className='min-w-0'>
                <span className='block text-sm font-bold text-ink'>{detail.nameVietnamese}</span>
                {detail.contentVietnamese ? (
                  <span className='block text-xs leading-5 text-muted'>{detail.contentVietnamese}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      )
    case 'INGREDIENT':
      return (
        <ul className='flex flex-wrap gap-2'>
          {details.map((detail) => (
            <li
              key={detail.sortOrder}
              className='rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-clinic-deep'
            >
              {detail.contentVietnamese}
            </li>
          ))}
        </ul>
      )
    case 'USAGE':
      return (
        <ol className='space-y-2'>
          {details.map((detail, index) => (
            <li key={detail.sortOrder} className='flex gap-3 text-sm leading-6 text-ink/80'>
              <span className='grid size-6 shrink-0 place-items-center rounded-full bg-clinic text-[11px] font-bold text-white'>
                {index + 1}
              </span>
              {detail.contentVietnamese}
            </li>
          ))}
        </ol>
      )
    case 'GALLERY':
      return (
        <ul className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
          {details.map((detail) =>
            detail.image ? (
              <li key={detail.sortOrder}>
                <img
                  src={detail.image}
                  alt={detail.imageAlt ?? ''}
                  className='aspect-square w-full rounded-2xl bg-canvas object-cover'
                />
              </li>
            ) : null
          )}
        </ul>
      )
    default:
      return (
        <ul className='space-y-2'>
          {details.map((detail) => (
            <li key={detail.sortOrder} className='flex gap-2 text-sm leading-6 text-ink/80'>
              <Icon
                name={type === 'NOTE' ? 'info' : 'check_circle'}
                size={18}
                className='mt-0.5 shrink-0 text-clinic'
              />
              {detail.contentVietnamese}
            </li>
          ))}
        </ul>
      )
  }
}

/** Trang chi tiết sản phẩm trong cổng: nhân viên chỉ xem để tư vấn, quản lý và quản trị được sửa / ẩn. */
export function ProductDetailPage({ role }: { readonly role: PortalRole }) {
  const { productID = '' } = useParams()
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const canManage = role !== 'staff'
  const [product, setProduct] = useState<Product>()
  const [error, setError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)
  const [variantIndex, setVariantIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [form, setForm] = useState({ session: 0, open: false })
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    let cancelled = false
    setError(undefined)
    productApi
      .getProduct(productID)
      .then((next) => {
        if (!cancelled) setProduct(next)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Không tải được sản phẩm.')
      })
    return () => {
      cancelled = true
    }
  }, [productID, reloadKey])

  useEffect(() => {
    setVariantIndex(0)
    setImageIndex(0)
  }, [productID])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])

  async function openEdit() {
    try {
      if (categories.length === 0) setCategories(await productApi.listCategories())
      setForm((current) => ({ session: current.session + 1, open: true }))
    } catch (reason) {
      toast.error('Không tải được danh mục', reason instanceof Error ? reason.message : undefined)
    }
  }

  async function toggleStatus() {
    if (!product) return
    const status = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setToggling(true)
    try {
      await productApi.updateProduct(product.productID, { status })
      toast.success(`${product.nameVietnamese}: ${status === 'ACTIVE' ? 'đã mở bán lại' : 'đã tạm ẩn'}.`)
      reload()
    } catch (reason) {
      toast.error('Không đổi được trạng thái', reason instanceof Error ? reason.message : undefined)
    } finally {
      setToggling(false)
    }
  }

  const backLink = (
    <Link
      to={`/portal/${role}/products`}
      className='inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-clinic'
    >
      <Icon name='arrow_back' size={18} />
      Sản phẩm
    </Link>
  )

  if (error) {
    return (
      <div>
        {backLink}
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='inventory_2' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{error}</p>
          <button type='button' className={outlineButtonClass} onClick={reload}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div>
        {backLink}
        <div className='mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <div className='h-[480px] animate-pulse rounded-[28px] bg-white/70' />
          <div className='h-64 animate-pulse rounded-[28px] bg-white/70' />
        </div>
      </div>
    )
  }

  const variants = [...product.variants].sort((a, b) => a.sortOrder - b.sortOrder)
  const variant = variants[Math.min(variantIndex, variants.length - 1)]
  const images =
    variant && variant.images.length > 0
      ? variant.images.map((item) => ({ src: item.image, alt: item.altVietnamese ?? product.nameVietnamese }))
      : product.image
        ? [{ src: product.image, alt: product.imageAlt ?? product.nameVietnamese }]
        : []
  const image = images[Math.min(imageIndex, images.length - 1)]
  const price = variant?.price ?? product.price
  const compareAtPrice = variant ? variant.compareAtPrice : product.compareAtPrice
  const active = product.status === 'ACTIVE'

  const detailGroups = (Object.keys(detailTypeMeta) as ProductDetailType[])
    .map((type) => ({
      type,
      details: (product.details ?? [])
        .filter((detail) => detail.detailType === type)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }))
    .filter((group) => group.details.length > 0)

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {backLink}

      <div className='mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <article className={`${portalCardClass} p-5 sm:p-6`}>
          <div className='grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
            <div>
              <div className='grid aspect-square place-items-center overflow-hidden rounded-3xl bg-canvas text-clinic/50'>
                {image ? (
                  <img src={image.src} alt={image.alt} className='size-full object-cover' />
                ) : (
                  <Icon name='inventory_2' size={48} />
                )}
              </div>
              {images.length > 1 ? (
                <div className='mt-3 flex gap-2 overflow-x-auto'>
                  {images.map((item, index) => (
                    <button
                      key={`${item.src}-${index}`}
                      type='button'
                      onClick={() => setImageIndex(index)}
                      aria-label={`Ảnh ${index + 1}`}
                      aria-pressed={index === imageIndex}
                      className={`size-16 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                        index === imageIndex ? 'border-clinic' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={item.src} alt='' className='size-full object-cover' />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>
                  {product.category.nameVietnamese}
                </span>
                <StatusPill active={active} />
                {product.badge ? (
                  <span className='rounded-full bg-clinic/10 px-3 py-1 text-xs font-bold text-clinic'>
                    {product.badge}
                  </span>
                ) : null}
              </div>
              <h1 className='mt-2 text-3xl font-extrabold text-ink'>{product.nameVietnamese}</h1>
              {product.subtitleVietnamese ? (
                <p className='mt-1 text-sm font-semibold text-ink/70'>{product.subtitleVietnamese}</p>
              ) : null}

              <div className='mt-4 flex flex-wrap items-baseline gap-3'>
                <span className='text-3xl font-extrabold text-clinic tabular-nums'>{formatPrice(price)}</span>
                {compareAtPrice ? (
                  <span className='text-base text-muted line-through tabular-nums'>{formatPrice(compareAtPrice)}</span>
                ) : null}
              </div>

              {variants.length > 0 ? (
                <div className='mt-5'>
                  <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>
                    Phiên bản ({variants.length})
                  </p>
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {variants.map((item, index) => (
                      <button
                        key={item.productVariantID}
                        type='button'
                        onClick={() => {
                          setVariantIndex(index)
                          setImageIndex(0)
                        }}
                        aria-pressed={index === variantIndex}
                        className={`rounded-2xl border px-4 py-2 text-left text-sm transition ${
                          index === variantIndex
                            ? 'border-clinic bg-mist text-clinic-deep'
                            : 'border-rose-soft/60 text-ink hover:border-clinic/50'
                        } ${item.status === 'ACTIVE' ? '' : 'opacity-60'}`}
                      >
                        <span className='block font-bold'>{item.nameVietnamese}</span>
                        <span className='block text-xs text-muted tabular-nums'>{formatPrice(item.price)}</span>
                      </button>
                    ))}
                  </div>
                  {variant ? (
                    <p className='mt-2 text-xs text-muted'>
                      SKU: <span className='font-mono'>{variant.sku ?? '—'}</span>
                      {variant.status === 'ACTIVE' ? '' : ' · Phiên bản đang tạm ẩn'}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {product.descriptionVietnamese ? (
                <p className='mt-5 text-sm leading-7 whitespace-pre-line text-ink/80'>
                  {product.descriptionVietnamese}
                </p>
              ) : null}

              {canManage ? (
                <div className='mt-6 flex flex-wrap gap-2'>
                  <button type='button' className={primaryButtonClass} onClick={() => void openEdit()}>
                    <Icon name='edit' size={18} />
                    Chỉnh sửa
                  </button>
                  <button
                    type='button'
                    className={outlineButtonClass}
                    disabled={toggling}
                    onClick={() => void toggleStatus()}
                  >
                    <Icon name={active ? 'visibility_off' : 'visibility'} size={18} />
                    {active ? 'Tạm ẩn' : 'Mở bán lại'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className='mt-6 space-y-5'>
            {detailGroups.map((group) => (
              <Section key={group.type} title={detailTypeMeta[group.type].label}>
                <DetailBlock type={group.type} details={group.details} />
              </Section>
            ))}
            {product.subtitleEnglish || product.descriptionEnglish ? (
              <Section title='Tiếng Anh (cho khách nước ngoài)'>
                {product.nameEnglish ? <p className='text-sm font-bold text-ink'>{product.nameEnglish}</p> : null}
                {product.subtitleEnglish ? <p className='text-sm text-ink/70'>{product.subtitleEnglish}</p> : null}
                {product.descriptionEnglish ? (
                  <p className='mt-2 text-sm leading-7 whitespace-pre-line text-ink/80'>{product.descriptionEnglish}</p>
                ) : null}
              </Section>
            ) : null}
          </div>
        </article>

        <aside className={`${portalCardClass} space-y-4 p-5 lg:sticky lg:top-24`} aria-label='Thông tin sản phẩm'>
          <h2 className='text-sm font-bold tracking-wide text-muted uppercase'>Thông tin</h2>
          <dl className='space-y-3 text-sm'>
            {[
              ['Mã sản phẩm', product.productID],
              ['Slug', product.slug],
              ['Danh mục', product.category.nameVietnamese],
              ['Tên English', product.nameEnglish],
              ['Tên Khmer', product.nameCambodia]
            ].map(([label, value]) => (
              <div key={label}>
                <dt className='text-[11px] font-bold tracking-wide text-muted uppercase'>{label}</dt>
                <dd className='mt-0.5 break-words text-ink'>{value || '—'}</dd>
              </div>
            ))}
          </dl>
          {variants.length > 0 ? (
            <div>
              <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>Bảng giá</p>
              <ul className='mt-1 divide-y divide-rose-soft/40'>
                {variants.map((item) => (
                  <li key={item.productVariantID} className='flex items-center justify-between gap-3 py-2 text-sm'>
                    <span className={item.status === 'ACTIVE' ? 'text-ink' : 'text-muted line-through'}>
                      {item.nameVietnamese}
                    </span>
                    <span className='font-bold text-ink tabular-nums'>{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {product.note && canManage ? (
            <div className='rounded-2xl bg-canvas px-4 py-3 text-sm text-ink/80'>
              <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>Ghi chú nội bộ</p>
              <p className='mt-1 whitespace-pre-line'>{product.note}</p>
            </div>
          ) : null}
          {active ? (
            <a
              href={`/products/${encodeURIComponent(product.slug)}`}
              target='_blank'
              rel='noreferrer'
              className={`${outlineButtonClass} w-full justify-center`}
            >
              <Icon name='open_in_new' size={18} />
              Xem trên website
            </a>
          ) : null}
        </aside>
      </div>

      {canManage ? (
        <ProductFormDialog
          key={form.session}
          open={form.open}
          product={product}
          categories={categories}
          defaultCategoryID={product.category.productCategoryID}
          onClose={closeForm}
          onSaved={(message) => {
            closeForm()
            toast.success(message)
            reload()
          }}
        />
      ) : null}
    </motion.div>
  )
}
