import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { toSlug } from '../services/catalog.api'
import { Field, FormError, PortalDialog, inputClass, outlineButtonClass, primaryButtonClass } from '../services/form-ui'
import { ProductDetailsEditor, rowsFromDetails, rowsToDetails, type DetailRow } from './ProductDetailsEditor'
import {
  ProductVariantsEditor,
  rowsFromVariants,
  rowsToVariants,
  validateVariants,
  type VariantRow,
  type VariantRowErrors
} from './ProductVariantsEditor'
import { productApi, type Product, type ProductCategory, type ProductPayload, type ProductStatus } from './product.api'
import { Select } from '~/components/ui/Select'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface FormValues {
  nameVietnamese: string
  nameEnglish: string
  nameCambodia: string
  slug: string
  productCategoryID: string
  subtitleVietnamese: string
  subtitleEnglish: string
  descriptionVietnamese: string
  descriptionEnglish: string
  image: string
  imageAlt: string
  badge: string
  status: ProductStatus
  note: string
}

type FormErrors = Partial<Record<'nameVietnamese' | 'nameEnglish' | 'productCategoryID' | 'slug', string>>

function initialValues(product: Product | null, defaultCategoryID: string): FormValues {
  return {
    nameVietnamese: product?.nameVietnamese ?? '',
    nameEnglish: product?.nameEnglish ?? '',
    nameCambodia: product?.nameCambodia ?? '',
    slug: product?.slug ?? '',
    productCategoryID: product?.category.productCategoryID ?? defaultCategoryID,
    subtitleVietnamese: product?.subtitleVietnamese ?? '',
    subtitleEnglish: product?.subtitleEnglish ?? '',
    descriptionVietnamese: product?.descriptionVietnamese ?? '',
    descriptionEnglish: product?.descriptionEnglish ?? '',
    image: product?.image ?? '',
    imageAlt: product?.imageAlt ?? '',
    badge: product?.badge ?? '',
    status: product?.status ?? 'ACTIVE',
    note: product?.note ?? ''
  }
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.nameVietnamese.trim()) errors.nameVietnamese = 'Nhập tên sản phẩm tiếng Việt.'
  if (!values.nameEnglish.trim()) errors.nameEnglish = 'Nhập tên sản phẩm tiếng Anh.'
  if (!values.productCategoryID) errors.productCategoryID = 'Chọn danh mục.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: FormValues, variants: readonly VariantRow[], rows: readonly DetailRow[]): ProductPayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: values.nameEnglish.trim(),
    nameCambodia: blank(values.nameCambodia),
    slug: values.slug,
    productCategoryID: values.productCategoryID,
    subtitleVietnamese: blank(values.subtitleVietnamese),
    subtitleEnglish: blank(values.subtitleEnglish),
    subtitleCambodia: null,
    descriptionVietnamese: blank(values.descriptionVietnamese),
    descriptionEnglish: blank(values.descriptionEnglish),
    descriptionCambodia: null,
    image: blank(values.image),
    imageAlt: blank(values.imageAlt),
    badge: blank(values.badge),
    status: values.status,
    note: blank(values.note),
    variants: rowsToVariants(variants),
    details: rowsToDetails(rows)
  }
}

export interface ProductFormDialogProps {
  readonly open: boolean
  /** For editing, the full product (with details) from the single-product endpoint. */
  readonly product: Product | null
  readonly categories: readonly ProductCategory[]
  readonly defaultCategoryID: string
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}

export function ProductFormDialog({
  open,
  product,
  categories,
  defaultCategoryID,
  onClose,
  onSaved
}: ProductFormDialogProps) {
  const [values, setValues] = useState(() => initialValues(product, defaultCategoryID))
  const [variants, setVariants] = useState<VariantRow[]>(() => rowsFromVariants(product?.variants))
  const [variantErrors, setVariantErrors] = useState<Record<string, VariantRowErrors>>({})
  const [rows, setRows] = useState<DetailRow[]>(() => rowsFromDetails(product?.details))
  const [slugTouched, setSlugTouched] = useState(Boolean(product))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    const syncSlug = !slugTouched && (field === 'nameVietnamese' || field === 'nameEnglish')
    setValues((current) => {
      const next = { ...current, [field]: value }
      if (syncSlug) next.slug = toSlug(next.nameEnglish || next.nameVietnamese)
      return next
    })
    setErrors((current) => ({ ...current, [field]: undefined, ...(syncSlug && { slug: undefined }) }))
  }

  async function submit() {
    if (uploading) return
    const nextErrors = validate(values)
    const nextVariantErrors = validateVariants(variants)
    setErrors(nextErrors)
    setVariantErrors(nextVariantErrors)
    if (Object.values(nextErrors).some(Boolean) || Object.keys(nextVariantErrors).length > 0) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const payload = toPayload(values, variants, rows)
      if (product) {
        await productApi.updateProduct(product.productID, payload)
        onSaved(`Đã cập nhật sản phẩm "${payload.nameVietnamese}".`)
      } else {
        await productApi.createProduct(payload)
        onSaved(`Đã thêm sản phẩm "${payload.nameVietnamese}".`)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu sản phẩm.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
      description='Thông tin hiển thị ở trang Sản phẩm và trang chi tiết sản phẩm trên website.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy || uploading}>
            <Icon name='save' size={18} />
            {busy ? 'Đang lưu...' : product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />

      <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Thông tin chính</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Tên tiếng Việt' required error={errors.nameVietnamese}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameVietnamese}
              onChange={(event) => update('nameVietnamese', event.target.value)}
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Tên English' required error={errors.nameEnglish}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameEnglish}
              onChange={(event) => update('nameEnglish', event.target.value)}
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Tên Khmer (Cambodia)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameCambodia}
              onChange={(event) => update('nameCambodia', event.target.value)}
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Slug' required error={errors.slug} hint='Dùng cho link /products/slug.'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true)
                update('slug', event.target.value.toLowerCase())
              }}
              maxLength={150}
            />
          )}
        </Field>
        <Field label='Danh mục' required error={errors.productCategoryID}>
          {(id) => (
            <Select
              id={id}
              value={values.productCategoryID}
              onChange={(value) => update('productCategoryID', value)}
              placeholder='Chọn danh mục'
              options={categories.map((category) => ({
                value: category.productCategoryID,
                label: `${category.nameVietnamese}${category.isActive ? '' : ' (tạm ẩn)'}`
              }))}
            />
          )}
        </Field>
        <Field label='Trạng thái'>
          {(id) => (
            <Select
              id={id}
              value={values.status}
              onChange={(value) => update('status', value)}
              options={[
                { value: 'ACTIVE', label: 'Đang bán' },
                { value: 'INACTIVE', label: 'Tạm ẩn' }
              ]}
            />
          )}
        </Field>
        <Field label='Tiêu đề phụ (Việt)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.subtitleVietnamese}
              onChange={(event) => update('subtitleVietnamese', event.target.value)}
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Subtitle (English)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.subtitleEnglish}
              onChange={(event) => update('subtitleEnglish', event.target.value)}
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Mô tả (Việt)'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              className={`${inputClass} resize-y`}
              value={values.descriptionVietnamese}
              onChange={(event) => update('descriptionVietnamese', event.target.value)}
              maxLength={4000}
            />
          )}
        </Field>
        <Field label='Description (English)'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              className={`${inputClass} resize-y`}
              value={values.descriptionEnglish}
              onChange={(event) => update('descriptionEnglish', event.target.value)}
              maxLength={4000}
            />
          )}
        </Field>
      </div>

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Phiên bản & giá</p>
      <p className='mt-1 text-xs text-muted'>
        Mỗi phiên bản là một lựa chọn có giá riêng (VD: 100ml / 150ml, hộp giấy / hộp sứ / set). Giá hiển thị ngoài danh
        sách là giá thấp nhất trong các phiên bản đang bán.
      </p>
      <div className='mt-4'>
        <ProductVariantsEditor
          rows={variants}
          errors={variantErrors}
          onChange={setVariants}
          onUploadingChange={setUploading}
        />
      </div>

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Ảnh & nhãn</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Nhãn' hint='VD: Bán chạy, Mới.'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.badge}
              onChange={(event) => update('badge', event.target.value)}
              maxLength={100}
            />
          )}
        </Field>
        <Field label='Ảnh chính'>
          {(id) => (
            <ImageUpload
              id={id}
              folder='products'
              value={values.image}
              onChange={(url, alt) => {
                update('image', url)
                if (alt !== undefined) update('imageAlt', alt)
              }}
              onUploadingChange={setUploading}
            />
          )}
        </Field>
        <Field label='Ghi chú nội bộ' className='sm:col-span-2'>
          {(id) => (
            <textarea
              id={id}
              rows={2}
              className={`${inputClass} resize-y`}
              value={values.note}
              onChange={(event) => update('note', event.target.value)}
              maxLength={1000}
            />
          )}
        </Field>
      </div>

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Chi tiết sản phẩm</p>
      <div className='mt-4'>
        <ProductDetailsEditor rows={rows} onChange={setRows} onUploadingChange={setUploading} />
      </div>
    </PortalDialog>
  )
}
