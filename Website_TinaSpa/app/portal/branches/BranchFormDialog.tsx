import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { toSlug } from '~/portal/manager/services/catalog.api'
import {
  Field,
  FormError,
  PortalDialog,
  Toggle,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { branchesApi, type BranchPayload, type ManagedBranch } from './branches.api'

interface BranchFormValues {
  readonly nameVietnamese: string
  readonly nameEnglish: string
  readonly slug: string
  readonly addressVietnamese: string
  readonly addressEnglish: string
  readonly hotline: string
  readonly openTime: string
  readonly closeTime: string
  readonly sortOrder: string
  readonly active: boolean
  readonly note: string
}

type FormErrors = Partial<Record<keyof BranchFormValues, string>>

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toValues(branch: ManagedBranch | null): BranchFormValues {
  return {
    nameVietnamese: branch?.nameVietnamese ?? '',
    nameEnglish: branch?.nameEnglish ?? '',
    slug: branch?.slug ?? '',
    addressVietnamese: branch?.addressVietnamese ?? '',
    addressEnglish: branch?.addressEnglish ?? '',
    hotline: branch?.hotline ?? '',
    openTime: branch?.openTime ?? '08:00',
    closeTime: branch?.closeTime ?? '20:00',
    sortOrder: String(branch?.sortOrder ?? 0),
    active: (branch?.status ?? 'ACTIVE') === 'ACTIVE',
    note: branch?.note ?? ''
  }
}

function validate(values: BranchFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.nameVietnamese.trim()) errors.nameVietnamese = 'Nhập tên chi nhánh.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Chỉ gồm chữ thường không dấu, số và dấu gạch ngang.'
  if (!values.openTime) errors.openTime = 'Chọn giờ mở cửa.'
  if (!values.closeTime) errors.closeTime = 'Chọn giờ đóng cửa.'
  else if (values.closeTime <= values.openTime) errors.closeTime = 'Giờ đóng cửa phải sau giờ mở cửa.'
  if (!/^\d+$/.test(values.sortOrder)) errors.sortOrder = 'Thứ tự là số nguyên không âm.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: BranchFormValues): BranchPayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: blank(values.nameEnglish),
    slug: values.slug,
    addressVietnamese: blank(values.addressVietnamese),
    addressEnglish: blank(values.addressEnglish),
    hotline: blank(values.hotline),
    openTime: values.openTime,
    closeTime: values.closeTime,
    sortOrder: Number(values.sortOrder),
    status: values.active ? 'ACTIVE' : 'INACTIVE',
    note: blank(values.note)
  }
}

export interface BranchFormDialogProps {
  readonly open: boolean
  readonly branch: ManagedBranch | null
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}

export function BranchFormDialog({ open, branch, onClose, onSaved }: BranchFormDialogProps) {
  const [values, setValues] = useState(() => toValues(branch))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  // Tự sinh slug theo tên cho tới khi người dùng sửa slug bằng tay.
  const [slugTouched, setSlugTouched] = useState(branch !== null)

  function update<K extends keyof BranchFormValues>(field: K, value: BranchFormValues[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'nameVietnamese' && !slugTouched ? { slug: toSlug(String(value)).slice(0, 50) } : {})
    }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function submit() {
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const payload = toPayload(values)
      if (branch) {
        await branchesApi.update(branch.branchID, payload)
        onSaved(`Đã cập nhật chi nhánh "${payload.nameVietnamese}".`)
      } else {
        await branchesApi.create(payload)
        onSaved(`Đã thêm chi nhánh "${payload.nameVietnamese}".`)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể lưu chi nhánh.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={branch ? `Sửa chi nhánh ${branch.nameVietnamese}` : 'Thêm chi nhánh'}
      description='Chi nhánh đang mở sẽ hiện trong form đặt lịch; giờ mở cửa giới hạn khung giờ khách được chọn.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name={branch ? 'save' : 'add_business'} size={18} />
            {busy ? 'Đang lưu...' : branch ? 'Lưu thay đổi' : 'Thêm chi nhánh'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />

      <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Thông tin chung</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        <Field label='Tên chi nhánh' required error={errors.nameVietnamese}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameVietnamese}
              onChange={(event) => update('nameVietnamese', event.target.value)}
              placeholder='VD: TinaSpa Bến Nghé — Quận 1'
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Tên tiếng Anh'>
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
        <Field label='Slug' required error={errors.slug} hint='Dùng trong đường dẫn, VD: ben-nghe-quan-1'>
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
        <Field label='Hotline'>
          {(id) => (
            <input
              id={id}
              type='tel'
              className={inputClass}
              value={values.hotline}
              onChange={(event) => update('hotline', event.target.value)}
              placeholder='VD: 0901 234 567'
              maxLength={100}
            />
          )}
        </Field>
        <Field label='Địa chỉ' className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.addressVietnamese}
              onChange={(event) => update('addressVietnamese', event.target.value)}
              placeholder='Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành'
              maxLength={255}
            />
          )}
        </Field>
        <Field label='Địa chỉ tiếng Anh' className='sm:col-span-2'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.addressEnglish}
              onChange={(event) => update('addressEnglish', event.target.value)}
              maxLength={255}
            />
          )}
        </Field>
      </div>

      <p className='mt-6 text-xs font-bold tracking-[0.16em] text-clinic uppercase'>Vận hành</p>
      <div className='mt-4 grid gap-4 sm:grid-cols-3'>
        <Field label='Giờ mở cửa' required error={errors.openTime}>
          {(id) => (
            <input
              id={id}
              type='time'
              className={inputClass}
              value={values.openTime}
              onChange={(event) => update('openTime', event.target.value)}
            />
          )}
        </Field>
        <Field label='Giờ đóng cửa' required error={errors.closeTime}>
          {(id) => (
            <input
              id={id}
              type='time'
              className={inputClass}
              value={values.closeTime}
              onChange={(event) => update('closeTime', event.target.value)}
            />
          )}
        </Field>
        <Field label='Thứ tự hiển thị' error={errors.sortOrder}>
          {(id) => (
            <input
              id={id}
              type='number'
              min={0}
              className={inputClass}
              value={values.sortOrder}
              onChange={(event) => update('sortOrder', event.target.value)}
            />
          )}
        </Field>
        <div className='sm:col-span-3'>
          <Toggle
            label='Đang nhận lịch'
            description='Tắt để tạm ngưng: chi nhánh ẩn khỏi form đặt lịch, dữ liệu cũ vẫn giữ nguyên.'
            checked={values.active}
            onChange={(checked) => update('active', checked)}
          />
        </div>
        <Field label='Ghi chú nội bộ' className='sm:col-span-3'>
          {(id) => (
            <textarea
              id={id}
              rows={2}
              className={inputClass}
              value={values.note}
              onChange={(event) => update('note', event.target.value)}
            />
          )}
        </Field>
      </div>
    </PortalDialog>
  )
}
