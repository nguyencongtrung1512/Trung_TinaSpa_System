import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import {
  catalogApi,
  formatPrice,
  toSlug,
  type CatalogCategory,
  type CatalogService,
  type CatalogStatus,
  type ServicePayload
} from './catalog.api'
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

interface ServiceFormValues {
  nameVietnamese: string
  nameEnglish: string
  nameCambodia: string
  shortDescriptionVietnamese: string
  shortDescriptionEnglish: string
  shortDescriptionCambodia: string
  descriptionVietnamese: string
  descriptionEnglish: string
  descriptionCambodia: string
  serviceCategoryID: string
  slug: string
  price: string
  durationMinutes: string
  image: string
  imageAlt: string
  isBookable: boolean
  sortOrder: string
  status: CatalogStatus
  note: string
}

type FormErrors = Partial<
  Record<'nameVietnamese' | 'serviceCategoryID' | 'slug' | 'price' | 'durationMinutes' | 'sortOrder', string>
>

function initialValues(service: CatalogService | null, defaultCategoryID: string): ServiceFormValues {
  return {
    nameVietnamese: service?.nameVietnamese ?? '',
    nameEnglish: service?.nameEnglish ?? '',
    nameCambodia: service?.nameCambodia ?? '',
    shortDescriptionVietnamese: service?.shortDescriptionVietnamese ?? '',
    shortDescriptionEnglish: service?.shortDescriptionEnglish ?? '',
    shortDescriptionCambodia: service?.shortDescriptionCambodia ?? '',
    descriptionVietnamese: service?.descriptionVietnamese ?? '',
    descriptionEnglish: service?.descriptionEnglish ?? '',
    descriptionCambodia: service?.descriptionCambodia ?? '',
    serviceCategoryID: service?.category?.serviceCategoryID ?? defaultCategoryID,
    slug: service?.slug ?? '',
    price: service ? String(service.price) : '',
    durationMinutes: service?.durationMinutes ? String(service.durationMinutes) : '',
    image: service?.image ?? '',
    imageAlt: service?.imageAlt ?? '',
    isBookable: service?.isBookable ?? true,
    sortOrder: String(service?.sortOrder ?? 0),
    status: service?.status ?? 'ACTIVE',
    note: service?.note ?? ''
  }
}

const digitsOnly = (value: string) => value.replaceAll(/\D/g, '')

function validate(values: ServiceFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.nameVietnamese.trim()) errors.nameVietnamese = 'Nhập tên dịch vụ tiếng Việt.'
  if (!values.serviceCategoryID) errors.serviceCategoryID = 'Chọn nhóm dịch vụ.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.'
  if (!/^\d+$/.test(values.price)) errors.price = 'Nhập giá (VND), số nguyên từ 0.'
  if (values.durationMinutes && !/^[1-9]\d*$/.test(values.durationMinutes)) {
    errors.durationMinutes = 'Thời lượng là số phút lớn hơn 0.'
  }
  if (!/^\d+$/.test(values.sortOrder)) errors.sortOrder = 'Thứ tự là số nguyên từ 0.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: ServiceFormValues): ServicePayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: blank(values.nameEnglish),
    nameCambodia: blank(values.nameCambodia),
    shortDescriptionVietnamese: blank(values.shortDescriptionVietnamese),
    shortDescriptionEnglish: blank(values.shortDescriptionEnglish),
    shortDescriptionCambodia: blank(values.shortDescriptionCambodia),
    descriptionVietnamese: blank(values.descriptionVietnamese),
    descriptionEnglish: blank(values.descriptionEnglish),
    descriptionCambodia: blank(values.descriptionCambodia),
    serviceCategoryID: values.serviceCategoryID,
    slug: values.slug,
    price: Number(values.price),
    durationMinutes: values.durationMinutes ? Number(values.durationMinutes) : null,
    image: blank(values.image),
    imageAlt: blank(values.imageAlt),
    isBookable: values.isBookable,
    sortOrder: Number(values.sortOrder),
    status: values.status,
    note: blank(values.note)
  }
}

export interface ServiceFormDialogProps {
  readonly open: boolean
  readonly service: CatalogService | null
  readonly categories: readonly CatalogCategory[]
  readonly defaultCategoryID: string
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}

export function ServiceFormDialog({
  open,
  service,
  categories,
  defaultCategoryID,
  onClose,
  onSaved
}: ServiceFormDialogProps) {
  const [values, setValues] = useState(() => initialValues(service, defaultCategoryID))
  const [slugTouched, setSlugTouched] = useState(Boolean(service))
  const [language, setLanguage] = useState<FormLanguage['code']>('vi')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const activeLanguage = formLanguages.find((item) => item.code === language) ?? formLanguages[0]

  function update<K extends keyof ServiceFormValues>(field: K, value: ServiceFormValues[K]) {
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
      if (service) {
        await catalogApi.updateService(service.serviceID, payload)
        onSaved(`Đã cập nhật dịch vụ "${payload.nameVietnamese}".`)
      } else {
        await catalogApi.createService(payload)
        onSaved(`Đã thêm dịch vụ "${payload.nameVietnamese}".`)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu dịch vụ.')
    } finally {
      setBusy(false)
    }
  }

  const nameField = `name${activeLanguage.suffix}` as const
  const shortField = `shortDescription${activeLanguage.suffix}` as const
  const descriptionField = `description${activeLanguage.suffix}` as const

  return (
    <PortalDialog
      open={open}
      title={service ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
      description='Mỗi dịch vụ là một dòng trong khối menu ở trang Dịch vụ: tên, mô tả ngắn, giá và mô tả đầy đủ khi bấm "+".'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='save' size={18} />
            {busy ? 'Đang lưu...' : service ? 'Lưu thay đổi' : 'Thêm dịch vụ'}
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
          label={`Tên dịch vụ (${activeLanguage.label})`}
          required={language === 'vi'}
          error={language === 'vi' ? errors.nameVietnamese : undefined}
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values[nameField]}
              onChange={(event) => update(nameField, event.target.value)}
              placeholder={language === 'vi' ? 'VD: Perfectly Polished' : ''}
              maxLength={255}
            />
          )}
        </Field>
        <Field
          label={`Mô tả ngắn (${activeLanguage.label})`}
          hint={`Một dòng dưới tên dịch vụ, tối đa 500 ký tự (${values[shortField].length}/500).`}
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values[shortField]}
              onChange={(event) => update(shortField, event.target.value)}
              maxLength={500}
            />
          )}
        </Field>
        <Field label={`Mô tả đầy đủ (${activeLanguage.label})`} hint='Hiện khi khách bấm "+" để mở dịch vụ.'>
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

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Giá & cấu hình</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Nhóm dịch vụ' required error={errors.serviceCategoryID}>
          {(id) => (
            <select
              id={id}
              className={inputClass}
              value={values.serviceCategoryID}
              onChange={(event) => update('serviceCategoryID', event.target.value)}
            >
              <option value=''>Chọn nhóm</option>
              {categories.map((category) => (
                <option key={category.serviceCategoryID} value={category.serviceCategoryID}>
                  {category.nameVietnamese}
                  {category.status === 'INACTIVE' ? ' (tạm ẩn)' : ''}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label='Slug' required error={errors.slug} hint='Dùng cho link đặt lịch /booking?service=slug.'>
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
        <Field
          label='Giá (VND)'
          required
          error={errors.price}
          hint={values.price ? `Hiển thị: ${formatPrice(Number(values.price))}` : 'VD: 390000'}
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              inputMode='numeric'
              value={values.price}
              onChange={(event) => update('price', digitsOnly(event.target.value))}
            />
          )}
        </Field>
        <Field label='Thời lượng (phút)' error={errors.durationMinutes}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              inputMode='numeric'
              value={values.durationMinutes}
              onChange={(event) => update('durationMinutes', digitsOnly(event.target.value))}
              placeholder='VD: 60'
            />
          )}
        </Field>
        <Field label='Thứ tự trong nhóm' error={errors.sortOrder}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              inputMode='numeric'
              value={values.sortOrder}
              onChange={(event) => update('sortOrder', digitsOnly(event.target.value))}
            />
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
        <Field label='Ảnh riêng' hint='Để trống sẽ dùng ảnh của nhóm.' className='sm:col-span-2'>
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
        <Toggle
          label='Cho phép đặt lịch'
          description='Khách chọn được dịch vụ này khi đặt lịch.'
          checked={values.isBookable}
          onChange={(value) => update('isBookable', value)}
        />
        <Field label='Mô tả ảnh (alt)'>
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
