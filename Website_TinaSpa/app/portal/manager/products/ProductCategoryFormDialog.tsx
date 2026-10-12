import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { toSlug } from '../services/catalog.api'
import {
  Field,
  FormError,
  PortalDialog,
  Toggle,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '../services/form-ui'
import { productApi, type ProductCategory, type ProductCategoryPayload } from './product.api'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface FormValues {
  nameVietnamese: string
  nameEnglish: string
  nameCambodia: string
  slug: string
  description: string
  displayOrder: string
  isActive: boolean
  note: string
}

type FormErrors = Partial<Record<'nameVietnamese' | 'slug' | 'displayOrder', string>>

function initialValues(category: ProductCategory | null, nextOrder: number): FormValues {
  return {
    nameVietnamese: category?.nameVietnamese ?? '',
    nameEnglish: category?.nameEnglish ?? '',
    nameCambodia: category?.nameCambodia ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    displayOrder: String(category?.displayOrder ?? nextOrder),
    isActive: category?.isActive ?? true,
    note: category?.note ?? ''
  }
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.nameVietnamese.trim()) errors.nameVietnamese = 'Nhập tên danh mục tiếng Việt.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.'
  if (!/^\d+$/.test(values.displayOrder)) errors.displayOrder = 'Thứ tự là số nguyên từ 0.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: FormValues): ProductCategoryPayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: blank(values.nameEnglish),
    nameCambodia: blank(values.nameCambodia),
    slug: values.slug,
    description: blank(values.description),
    displayOrder: Number(values.displayOrder),
    isActive: values.isActive,
    note: blank(values.note)
  }
}

export interface ProductCategoryFormDialogProps {
  readonly open: boolean
  readonly category: ProductCategory | null
  readonly nextOrder: number
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}

export function ProductCategoryFormDialog({ open, category, nextOrder, onClose, onSaved }: ProductCategoryFormDialogProps) {
  const [values, setValues] = useState(() => initialValues(category, nextOrder))
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)

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
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const payload = toPayload(values)
      if (category) {
        await productApi.updateCategory(category.productCategoryID, payload)
        onSaved(`Đã cập nhật danh mục "${payload.nameVietnamese}".`)
      } else {
        await productApi.createCategory(payload)
        onSaved(`Đã thêm danh mục "${payload.nameVietnamese}".`)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu danh mục.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={category ? 'Sửa danh mục sản phẩm' : 'Thêm danh mục sản phẩm'}
      description='Danh mục dùng để nhóm sản phẩm trên trang Sản phẩm của website.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='save' size={18} />
            {busy ? 'Đang lưu...' : category ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />
      <div className='grid gap-4 sm:grid-cols-2'>
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
        <Field label='Tên English'>
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
        <Field label='Slug' required error={errors.slug}>
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
        <Field label='Thứ tự hiển thị' error={errors.displayOrder}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              inputMode='numeric'
              value={values.displayOrder}
              onChange={(event) => update('displayOrder', event.target.value.replaceAll(/\D/g, ''))}
            />
          )}
        </Field>
        <div className='self-end'>
          <Toggle
            label='Hiển thị trên website'
            description='Tắt để tạm ẩn danh mục và sản phẩm bên trong.'
            checked={values.isActive}
            onChange={(value) => update('isActive', value)}
          />
        </div>
        <Field label='Mô tả' className='sm:col-span-2'>
          {(id) => (
            <textarea
              id={id}
              rows={2}
              className={`${inputClass} resize-y`}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
              maxLength={2000}
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
    </PortalDialog>
  )
}
