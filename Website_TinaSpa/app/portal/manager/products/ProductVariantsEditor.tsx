import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { formatPrice } from '../services/catalog.api'
import { Field, iconButtonClass, inputClass, outlineButtonClass } from '../services/form-ui'
import type { ProductStatus, ProductVariant, ProductVariantImage } from './product.api'
import { Select } from '~/components/ui/Select'

export interface VariantRow {
  /** Local key only; never sent to the API. */
  readonly key: string
  /** Set for variants that already exist, so an edit updates them instead of recreating. */
  readonly productVariantID?: string
  readonly nameVietnamese: string
  readonly nameEnglish: string
  readonly sku: string
  readonly price: string
  readonly compareAtPrice: string
  readonly images: readonly ProductVariantImage[]
  readonly status: ProductStatus
}

export type VariantRowErrors = Partial<Record<'nameVietnamese' | 'price' | 'compareAtPrice', string>>

let counter = 0
const nextKey = () => `variant-${(counter += 1)}`

export function newVariantRow(): VariantRow {
  return {
    key: nextKey(),
    nameVietnamese: '',
    nameEnglish: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    images: [],
    status: 'ACTIVE'
  }
}

export function rowsFromVariants(variants: readonly ProductVariant[] | undefined): VariantRow[] {
  if (!variants || variants.length === 0) return [newVariantRow()]
  return [...variants]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((variant) => ({
      key: nextKey(),
      productVariantID: variant.productVariantID,
      nameVietnamese: variant.nameVietnamese,
      nameEnglish: variant.nameEnglish ?? '',
      sku: variant.sku ?? '',
      price: String(variant.price),
      compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : '',
      images: variant.images.map((item) => ({
        image: item.image,
        altVietnamese: item.altVietnamese,
        altEnglish: item.altEnglish
      })),
      status: variant.status
    }))
}

export function validateVariants(rows: readonly VariantRow[]): Record<string, VariantRowErrors> {
  const errors: Record<string, VariantRowErrors> = {}
  for (const row of rows) {
    const rowErrors: VariantRowErrors = {}
    if (!row.nameVietnamese.trim()) rowErrors.nameVietnamese = 'Nhập tên phiên bản.'
    if (!/^\d+$/.test(row.price)) rowErrors.price = 'Nhập giá (VND).'
    else if (row.compareAtPrice && Number(row.compareAtPrice) < Number(row.price)) {
      rowErrors.compareAtPrice = 'Giá gốc phải ≥ giá bán.'
    }
    if (Object.keys(rowErrors).length > 0) errors[row.key] = rowErrors
  }
  return errors
}

const blank = (value: string) => value.trim() || null

export function rowsToVariants(rows: readonly VariantRow[]) {
  return rows.map((row, index) => ({
    ...(row.productVariantID ? { productVariantID: row.productVariantID } : {}),
    nameVietnamese: row.nameVietnamese.trim(),
    nameEnglish: blank(row.nameEnglish),
    nameCambodia: null,
    sku: blank(row.sku),
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
    images: row.images.map((item) => ({
      image: item.image,
      altVietnamese: item.altVietnamese,
      altEnglish: item.altEnglish
    })),
    status: row.status,
    sortOrder: index
  }))
}

function moveImage(images: readonly ProductVariantImage[], index: number, offset: number) {
  const next = [...images]
  const [moved] = next.splice(index, 1)
  next.splice(index + offset, 0, moved)
  return next
}

const digitsOnly = (value: string) => value.replaceAll(/\D/g, '')

export interface ProductVariantsEditorProps {
  readonly rows: readonly VariantRow[]
  readonly errors: Record<string, VariantRowErrors>
  readonly onChange: (rows: VariantRow[]) => void
  readonly onUploadingChange: (uploading: boolean) => void
}

const MAX_IMAGES = 10

export function ProductVariantsEditor({ rows, errors, onChange, onUploadingChange }: ProductVariantsEditorProps) {
  const patch = (key: string, changes: Partial<VariantRow>) =>
    onChange(rows.map((row) => (row.key === key ? { ...row, ...changes } : row)))

  return (
    <div>
      <ul className='space-y-3'>
        {rows.map((row, index) => {
          const rowErrors = errors[row.key] ?? {}
          return (
            <li key={row.key} className='rounded-2xl border border-rose-soft/70 bg-canvas/40 p-3'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='text-xs font-bold text-muted'>Phiên bản #{index + 1}</span>
                <button
                  type='button'
                  className={`${iconButtonClass} hover:text-red-600 disabled:opacity-30`}
                  aria-label={`Xóa phiên bản ${index + 1}`}
                  disabled={rows.length === 1}
                  title={rows.length === 1 ? 'Sản phẩm cần ít nhất một phiên bản' : undefined}
                  onClick={() => onChange(rows.filter((item) => item.key !== row.key))}
                >
                  <Icon name='delete' size={18} />
                </button>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                <Field label='Tên (Việt)' required error={rowErrors.nameVietnamese}>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={row.nameVietnamese}
                      placeholder='VD: 100ml, Hộp giấy, Set quà tặng'
                      maxLength={255}
                      onChange={(event) => patch(row.key, { nameVietnamese: event.target.value })}
                    />
                  )}
                </Field>
                <Field label='Name (English)'>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={row.nameEnglish}
                      placeholder='e.g. 100ml, Paper box, Gift set'
                      maxLength={255}
                      onChange={(event) => patch(row.key, { nameEnglish: event.target.value })}
                    />
                  )}
                </Field>
                <Field
                  label='Giá bán (VND)'
                  required
                  error={rowErrors.price}
                  hint={row.price ? `Hiển thị: ${formatPrice(Number(row.price))}` : undefined}
                >
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      inputMode='numeric'
                      value={row.price}
                      onChange={(event) => patch(row.key, { price: digitsOnly(event.target.value) })}
                    />
                  )}
                </Field>
                <Field label='Giá gốc (VND)' error={rowErrors.compareAtPrice} hint='Để trống nếu không giảm giá.'>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      inputMode='numeric'
                      value={row.compareAtPrice}
                      onChange={(event) => patch(row.key, { compareAtPrice: digitsOnly(event.target.value) })}
                    />
                  )}
                </Field>
                <Field label='Mã SKU' hint='Không bắt buộc, không được trùng.'>
                  {(id) => (
                    <input
                      id={id}
                      className={inputClass}
                      value={row.sku}
                      maxLength={50}
                      onChange={(event) => patch(row.key, { sku: event.target.value })}
                    />
                  )}
                </Field>
                <Field label='Trạng thái'>
                  {(id) => (
                    <Select
                      id={id}
                      value={row.status}
                      onChange={(value) => patch(row.key, { status: value })}
                      options={[
                        { value: 'ACTIVE', label: 'Đang bán' },
                        { value: 'INACTIVE', label: 'Tạm ẩn' }
                      ]}
                    />
                  )}
                </Field>
                <div className='sm:col-span-2'>
                  <p className='mb-1.5 text-xs font-bold tracking-wide text-ink'>
                    Ảnh phiên bản ({row.images.length}/{MAX_IMAGES})
                  </p>
                  {row.images.length > 0 ? (
                    <ul className='mb-3 flex flex-wrap gap-3'>
                      {row.images.map((item, imageIndex) => (
                        <li key={`${item.image}-${imageIndex}`} className='w-24'>
                          <div className='relative'>
                            <img
                              src={item.image}
                              alt=''
                              className='aspect-square w-full rounded-xl border border-rose-soft object-cover'
                            />
                            {imageIndex === 0 ? (
                              <span className='absolute top-1 left-1 rounded-full bg-clinic px-2 py-0.5 text-[10px] font-bold text-white'>
                                Ảnh bìa
                              </span>
                            ) : null}
                          </div>
                          <div className='mt-1 flex justify-between'>
                            <button
                              type='button'
                              className={`${iconButtonClass} disabled:opacity-30`}
                              aria-label='Dời ảnh sang trái'
                              disabled={imageIndex === 0}
                              onClick={() => patch(row.key, { images: moveImage(row.images, imageIndex, -1) })}
                            >
                              <Icon name='chevron_left' size={16} />
                            </button>
                            <button
                              type='button'
                              className={`${iconButtonClass} hover:text-red-600`}
                              aria-label='Xóa ảnh'
                              onClick={() =>
                                patch(row.key, { images: row.images.filter((_, at) => at !== imageIndex) })
                              }
                            >
                              <Icon name='delete' size={16} />
                            </button>
                            <button
                              type='button'
                              className={`${iconButtonClass} disabled:opacity-30`}
                              aria-label='Dời ảnh sang phải'
                              disabled={imageIndex === row.images.length - 1}
                              onClick={() => patch(row.key, { images: moveImage(row.images, imageIndex, 1) })}
                            >
                              <Icon name='chevron_right' size={16} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {row.images.length < MAX_IMAGES ? (
                    <ImageUpload
                      value=''
                      folder='products'
                      labels={{ choose: 'Thêm ảnh', replace: 'Thêm ảnh' }}
                      onChange={(url, alt) => {
                        if (url) {
                          patch(row.key, {
                            images: [...row.images, { image: url, altVietnamese: alt || null, altEnglish: null }]
                          })
                        }
                      }}
                      onUploadingChange={onUploadingChange}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      <button
        type='button'
        className={`${outlineButtonClass} mt-3`}
        onClick={() => onChange([...rows, newVariantRow()])}
      >
        <Icon name='add' size={16} />
        Thêm phiên bản
      </button>
    </div>
  )
}
