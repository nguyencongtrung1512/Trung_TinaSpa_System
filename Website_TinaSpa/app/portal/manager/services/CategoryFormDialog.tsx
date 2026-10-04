import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { catalogApi, toSlug, type CatalogCategory, type CatalogStatus, type CategoryPayload } from './catalog.api'
import {
  Field,
  FormError,
  LanguageTabs,
  PortalDialog,
  Toggle,
  formLanguages,
  inputClass,
  outlineButtonClass,
  primaryButtonClass,
  type FormLanguage
} from './form-ui'

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
  const [language, setLanguage] = useState<FormLanguage['code']>('vi')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const activeLanguage = formLanguages.find((item) => item.code === language) ?? formLanguages[0]

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
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (nextErrors.nameVietnamese) setLanguage('vi')
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

  const nameField = `name${activeLanguage.suffix}` as const
  const descriptionField = `description${activeLanguage.suffix}` as const

  return (
    <PortalDialog
      open={open}
      title={category ? 'Sửa nhóm dịch vụ' : 'Thêm nhóm dịch vụ'}
      description='Nhóm hiển thị thành tab lọc và khối menu ở trang Dịch vụ, card nổi bật ở trang chủ và ô "Dịch vụ quan tâm" khi đặt lịch.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='save' size={18} />
            {busy ? 'Đang lưu...' : category ? 'Lưu thay đổi' : 'Thêm nhóm'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Nội dung hiển thị</p>
        <LanguageTabs value={language} onChange={setLanguage} missing={errors.nameVietnamese ? ['vi'] : []} />
      </div>

      <div className='mt-4 grid gap-4'>
        <Field
          label={`Tên nhóm (${activeLanguage.label})`}
          required={language === 'vi'}
          error={language === 'vi' ? errors.nameVietnamese : undefined}
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values[nameField]}
              onChange={(event) => update(nameField, event.target.value)}
              placeholder={language === 'vi' ? 'VD: Gói Combo' : ''}
              maxLength={255}
            />
          )}
        </Field>
        <Field label={`Mô tả nhóm (${activeLanguage.label})`} hint='Hiển thị trên card "Dịch vụ nổi bật" ở trang chủ.'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              className={`${inputClass} resize-y`}
              value={values[descriptionField]}
              onChange={(event) => update(descriptionField, event.target.value)}
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
            <select
              id={id}
              className={inputClass}
              value={values.status}
              onChange={(event) => update('status', event.target.value as CatalogStatus)}
            >
              <option value='ACTIVE'>Đang mở</option>
              <option value='INACTIVE'>Tạm ẩn</option>
            </select>
          )}
        </Field>
        <Field label='Ảnh khối menu' hint='Đường dẫn ảnh, VD: /images/p1.png' className='sm:col-span-2'>
          {(id) => (
            <div className='flex items-center gap-3'>
              <input
                id={id}
                className={inputClass}
                value={values.image}
                onChange={(event) => update('image', event.target.value)}
              />
              {values.image ? (
                <img
                  src={values.image}
                  alt=''
                  className='size-11 shrink-0 rounded-xl border border-rose-soft object-cover'
                />
              ) : null}
            </div>
          )}
        </Field>
        <Field label='Mô tả ảnh (alt)' className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.imageAlt}
              onChange={(event) => update('imageAlt', event.target.value)}
              maxLength={255}
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
          description='Hiện trong ô "Dịch vụ quan tâm".'
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
