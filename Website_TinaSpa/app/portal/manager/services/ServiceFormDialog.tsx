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
import { Field, FormError, PortalDialog, inputClass, outlineButtonClass, primaryButtonClass } from './form-ui'
import { Select } from '~/components/ui/Select'

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
  status: CatalogStatus
  note: string
}

type FormErrors = Partial<
  Record<'nameVietnamese' | 'nameEnglish' | 'serviceCategoryID' | 'slug' | 'price' | 'durationMinutes', string>
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
    status: service?.status ?? 'ACTIVE',
    note: service?.note ?? ''
  }
}

const digitsOnly = (value: string) => value.replaceAll(/\D/g, '')

function validate(values: ServiceFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.nameVietnamese.trim()) errors.nameVietnamese = 'Nhập tên dịch vụ tiếng Việt.'
  if (!values.nameEnglish.trim()) errors.nameEnglish = 'Nhập tên dịch vụ tiếng Anh.'
  if (!values.serviceCategoryID) errors.serviceCategoryID = 'Chọn nhóm dịch vụ.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.'
  if (!/^\d+$/.test(values.price)) errors.price = 'Nhập giá (VND), số nguyên từ 0.'
  if (values.durationMinutes && !/^[1-9]\d*$/.test(values.durationMinutes)) {
    errors.durationMinutes = 'Thời lượng là số phút lớn hơn 0.'
  }
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: ServiceFormValues): ServicePayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: values.nameEnglish.trim(),
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
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)

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

      <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Nội dung hiển thị</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Tên tiếng Việt' required error={errors.nameVietnamese}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameVietnamese}
              onChange={(event) => update('nameVietnamese', event.target.value)}
              placeholder='VD: Chăm sóc móng hoàn hảo'
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
              placeholder='VD: Perfectly Polished'
              maxLength={255}
            />
          )}
        </Field>
        <Field
          label='Mô tả ngắn (tiếng Việt)'
          hint={`Một dòng dưới tên dịch vụ (${values.shortDescriptionVietnamese.length}/500).`}
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.shortDescriptionVietnamese}
              onChange={(event) => update('shortDescriptionVietnamese', event.target.value)}
              maxLength={500}
            />
          )}
        </Field>
        <Field
          label='Mô tả ngắn (English)'
          hint={`One line under the service name (${values.shortDescriptionEnglish.length}/500).`}
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.shortDescriptionEnglish}
              onChange={(event) => update('shortDescriptionEnglish', event.target.value)}
              maxLength={500}
            />
          )}
        </Field>
        <Field label='Mô tả đầy đủ (tiếng Việt)' hint='Hiện khi khách bấm "+" để mở dịch vụ.'>
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
        <Field label='Mô tả đầy đủ (English)' hint='Shown when the guest expands the service.'>
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

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Giá & cấu hình</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Nhóm dịch vụ' required error={errors.serviceCategoryID}>
          {(id) => (
            <Select
              id={id}
              value={values.serviceCategoryID}
              onChange={(value) => update('serviceCategoryID', value)}
              placeholder='Chọn nhóm'
              options={categories.map((category) => ({
                value: category.serviceCategoryID,
                label: `${category.nameVietnamese}${category.status === 'INACTIVE' ? ' (tạm ẩn)' : ''}`
              }))}
            />
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
