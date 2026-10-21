import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { catalogApi, toSlug, type CatalogCategory, type CatalogStatus, type CategoryPayload } from './catalog.api'
import { Field, FormError, PortalDialog, Toggle, inputClass, outlineButtonClass, primaryButtonClass } from './form-ui'
import { Select } from '~/components/ui/Select'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface CategoryFormValues {
  nameVietnamese: string
  nameEnglish: string
  nameCambodia: string
  descriptionVietnamese: string
  descriptionEnglish: string
  descriptionCambodia: string
  slug: string
  icon: string
  image: string
  imageAlt: string
  isFeatured: boolean
  isBookable: boolean
  sortOrder: string
  status: CatalogStatus
  note: string
}

type FormErrors = Partial<Record<'nameVietnamese' | 'slug' | 'sortOrder', string>>

function initialValues(category: CatalogCategory | null, nextSortOrder: number): CategoryFormValues {
  return {
    nameVietnamese: category?.nameVietnamese ?? '',
    nameEnglish: category?.nameEnglish ?? '',
    nameCambodia: category?.nameCambodia ?? '',
    descriptionVietnamese: category?.descriptionVietnamese ?? '',
    descriptionEnglish: category?.descriptionEnglish ?? '',
    descriptionCambodia: category?.descriptionCambodia ?? '',
    slug: category?.slug ?? '',
    icon: category?.icon ?? '',
    image: category?.image ?? '',
    imageAlt: category?.imageAlt ?? '',
    isFeatured: category?.isFeatured ?? false,
    isBookable: category?.isBookable ?? true,
    sortOrder: String(category?.sortOrder ?? nextSortOrder),
    status: category?.status ?? 'ACTIVE',
    note: category?.note ?? ''
  }
}

function validate(values: CategoryFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.nameVietnamese.trim()) errors.nameVietnamese = 'Nhập tên nhóm tiếng Việt.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.'
  if (!/^\d+$/.test(values.sortOrder)) errors.sortOrder = 'Thứ tự là số nguyên từ 0.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: CategoryFormValues): CategoryPayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: blank(values.nameEnglish),
    nameCambodia: blank(values.nameCambodia),
    descriptionVietnamese: blank(values.descriptionVietnamese),
    descriptionEnglish: blank(values.descriptionEnglish),
    descriptionCambodia: blank(values.descriptionCambodia),
    slug: values.slug,
    icon: blank(values.icon),
    image: blank(values.image),
    imageAlt: blank(values.imageAlt),
    isFeatured: values.isFeatured,
    isBookable: values.isBookable,
    sortOrder: Number(values.sortOrder),
    status: values.status,
    note: blank(values.note)
  }
}

export interface CategoryFormDialogProps {
  readonly open: boolean
  readonly category: CatalogCategory | null
  readonly nextSortOrder: number
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}

export function CategoryFormDialog({ open, category, nextSortOrder, onClose, onSaved }: CategoryFormDialogProps) {
  const [values, setValues] = useState(() => initialValues(category, nextSortOrder))
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  function update<K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) {
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
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const payload = toPayload(values)
      if (category) {
        await catalogApi.updateCategory(category.serviceCategoryID, payload)
        onSaved(`Đã cập nhật nhóm "${payload.nameVietnamese}".`)
      } else {
        await catalogApi.createCategory(payload)
        onSaved(`Đã thêm nhóm "${payload.nameVietnamese}".`)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu nhóm dịch vụ.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={category ? 'Sửa nhóm dịch vụ' : 'Thêm nhóm dịch vụ'}
      description='Nhóm hiển thị thành tab lọc và khối menu ở trang Dịch vụ, card nổi bật ở trang chủ và ô "Khu vực" khi đặt lịch.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy || uploading}>
            <Icon name='save' size={18} />
            {busy ? 'Đang lưu...' : uploading ? 'Đang tải ảnh...' : category ? 'Lưu thay đổi' : 'Thêm nhóm'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />

      <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Nội dung hiển thị</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Tên tiếng Việt' required error={errors.nameVietnamese}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameVietnamese}
              onChange={(event) => update('nameVietnamese', event.target.value)}
              placeholder='VD: Gói Combo'
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
              placeholder='VD: Combo Packages'
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Mô tả nhóm (tiếng Việt)' hint='Hiển thị trên card "Dịch vụ nổi bật" ở trang chủ.'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              className={`${inputClass} resize-y`}
              value={values.descriptionVietnamese}
              onChange={(event) => update('descriptionVietnamese', event.target.value)}
            />
          )}
        </Field>
        <Field label='Mô tả nhóm (English)' hint='Shown on the featured services card on the homepage.'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              className={`${inputClass} resize-y`}
              value={values.descriptionEnglish}
              onChange={(event) => update('descriptionEnglish', event.target.value)}
            />
          )}
        </Field>
      </div>

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Cấu hình</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Slug' required error={errors.slug} hint='Dùng cho đường dẫn /services#slug.'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.slug}
              onChange={(event) => {
                setSlugTouched(true)
                update('slug', event.target.value.toLowerCase())
              }}
              maxLength={50}
            />
          )}
        </Field>
        <Field label='Thứ tự hiển thị' error={errors.sortOrder}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              inputMode='numeric'
              value={values.sortOrder}
              onChange={(event) => update('sortOrder', event.target.value)}
            />
          )}
        </Field>
        <Field label='Icon' hint='Tên Material Symbols, VD: spa, dermatology.'>
          {(id) => (
            <div className='relative'>
              <input
                id={id}
                className={`${inputClass} pr-11`}
                value={values.icon}
                onChange={(event) => update('icon', event.target.value)}
                maxLength={50}
              />
              {values.icon ? (
                <Icon name={values.icon} size={20} className='absolute top-1/2 right-4 -translate-y-1/2 text-clinic' />
              ) : null}
            </div>
          )}
        </Field>
        <Field label='Trạng thái'>
          {(id) => (
            <Select
              id={id}
              value={values.status}
              onChange={(value) => update('status', value)}
              options={[
                { value: 'ACTIVE', label: 'Đang mở' },
                { value: 'INACTIVE', label: 'Tạm ẩn' }
              ]}
            />
          )}
        </Field>
        <Field label='Ảnh khối menu' hint='Mô tả ảnh (alt) lấy theo tên file tải lên.' className='sm:col-span-2'>
          {(id) => (
            <ImageUpload
              id={id}
              folder='services'
              value={values.image}
              onChange={(url, alt) => {
                update('image', url)
                if (alt !== undefined) update('imageAlt', alt)
              }}
              onUploadingChange={setUploading}
            />
          )}
        </Field>
        <Toggle
          label='Nổi bật trang chủ'
          description='Hiện ở mục "Dịch vụ nổi bật".'
          checked={values.isFeatured}
          onChange={(value) => update('isFeatured', value)}
        />
        <Toggle
          label='Cho phép đặt lịch'
          description='Hiện trong ô "Khu vực".'
          checked={values.isBookable}
          onChange={(value) => update('isBookable', value)}
        />
        <Field label='Ghi chú nội bộ' className='sm:col-span-2'>
          {(id) => (
            <textarea
              id={id}
              rows={2}
              className={`${inputClass} resize-y`}
              value={values.note}
              onChange={(event) => update('note', event.target.value)}
            />
          )}
        </Field>
      </div>
    </PortalDialog>
  )
}
