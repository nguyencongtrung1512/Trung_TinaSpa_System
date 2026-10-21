import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { ImageUpload } from '~/components/ui/ImageUpload'
import { treatmentResultsApi, type TreatmentResult, type TreatmentResultPayload } from '~/lib/treatment-results'
import {
  Field,
  FormError,
  PortalDialog,
  Toggle,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'

interface ResultValues {
  readonly titleVietnamese: string
  readonly titleEnglish: string
  readonly resultVietnamese: string
  readonly resultEnglish: string
  readonly summaryVietnamese: string
  readonly summaryEnglish: string
  readonly beforeImage: string
  readonly afterImage: string
  readonly sessionCount: string
  readonly durationWeeks: string
  readonly displayOrder: string
  readonly isActive: boolean
  readonly note: string
}

type ResultErrors = Partial<Record<keyof ResultValues, string>>

function toValues(result: TreatmentResult | undefined, nextOrder: number): ResultValues {
  return {
    titleVietnamese: result?.titleVietnamese ?? '',
    titleEnglish: result?.titleEnglish ?? '',
    resultVietnamese: result?.resultVietnamese ?? '',
    resultEnglish: result?.resultEnglish ?? '',
    summaryVietnamese: result?.summaryVietnamese ?? '',
    summaryEnglish: result?.summaryEnglish ?? '',
    beforeImage: result?.beforeImage ?? '',
    afterImage: result?.afterImage ?? '',
    sessionCount: result ? String(result.sessionCount) : '',
    durationWeeks: result ? String(result.durationWeeks) : '',
    displayOrder: String(result?.displayOrder ?? nextOrder),
    isActive: result?.isActive ?? true,
    note: result?.note ?? ''
  }
}

const isCount = (value: string) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 999

function validate(values: ResultValues): ResultErrors {
  const errors: ResultErrors = {}
  if (values.titleVietnamese.trim().length < 2) errors.titleVietnamese = 'Nhập tên liệu trình (ít nhất 2 ký tự).'
  if (values.resultVietnamese.trim().length < 2) errors.resultVietnamese = 'Nhập kết quả nổi bật.'
  if (!values.beforeImage.trim()) errors.beforeImage = 'Tải lên ảnh trước liệu trình.'
  if (!values.afterImage.trim()) errors.afterImage = 'Tải lên ảnh sau liệu trình.'
  if (!isCount(values.sessionCount)) errors.sessionCount = 'Số buổi từ 1 đến 999.'
  if (!isCount(values.durationWeeks)) errors.durationWeeks = 'Số tuần từ 1 đến 999.'
  if (!/^\d+$/.test(values.displayOrder)) errors.displayOrder = 'Thứ tự là số nguyên không âm.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: ResultValues): TreatmentResultPayload {
  return {
    titleVietnamese: values.titleVietnamese.trim(),
    titleEnglish: blank(values.titleEnglish),
    resultVietnamese: values.resultVietnamese.trim(),
    resultEnglish: blank(values.resultEnglish),
    summaryVietnamese: blank(values.summaryVietnamese),
    summaryEnglish: blank(values.summaryEnglish),
    beforeImage: values.beforeImage.trim(),
    afterImage: values.afterImage.trim(),
    sessionCount: Number(values.sessionCount),
    durationWeeks: Number(values.durationWeeks),
    displayOrder: Number(values.displayOrder),
    isActive: values.isActive,
    note: blank(values.note)
  }
}

/** Thêm mới khi không truyền `result`, ngược lại sửa kết quả đó. Mount lại (đổi `key`) mỗi lần mở. */
export function TreatmentResultDialog({
  open,
  result,
  nextOrder,
  onClose,
  onSaved
}: {
  readonly open: boolean
  readonly result?: TreatmentResult
  /** Default display order for a new result (after the last one). */
  readonly nextOrder: number
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}) {
  const editing = result !== undefined
  const [values, setValues] = useState(() => toValues(result, nextOrder))
  const [errors, setErrors] = useState<ResultErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [uploads, setUploads] = useState(0)

  function update<K extends keyof ResultValues>(field: K, value: ResultValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const trackUpload = (uploading: boolean) => setUploads((count) => Math.max(0, count + (uploading ? 1 : -1)))

  async function submit() {
    if (uploads > 0) return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setBusy(true)
    setSubmitError(undefined)
    try {
      const payload = toPayload(values)
      if (result) {
        await treatmentResultsApi.update(result.treatmentResultID, payload)
        onSaved(`Đã cập nhật kết quả "${payload.titleVietnamese}".`)
      } else {
        await treatmentResultsApi.create(payload)
        onSaved(`Đã thêm kết quả "${payload.titleVietnamese}".`)
      }
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Không lưu được kết quả.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={editing ? `Sửa kết quả ${result.titleVietnamese}` : 'Thêm kết quả thực tế'}
      description='Kết quả đang hiển thị sẽ xuất hiện ở mục "Kết quả thực tế" trên trang chủ.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy || uploads > 0}>
            <Icon name={editing ? 'save' : 'add'} size={18} />
            {busy ? 'Đang lưu...' : uploads > 0 ? 'Đang tải ảnh...' : editing ? 'Lưu thay đổi' : 'Thêm kết quả'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Ảnh trước (Before)' required error={errors.beforeImage}>
          {(id) => (
            <ImageUpload
              id={id}
              folder='results'
              value={values.beforeImage}
              onChange={(url) => update('beforeImage', url)}
              onUploadingChange={trackUpload}
            />
          )}
        </Field>
        <Field label='Ảnh sau (After)' required error={errors.afterImage}>
          {(id) => (
            <ImageUpload
              id={id}
              folder='results'
              value={values.afterImage}
              onChange={(url) => update('afterImage', url)}
              onUploadingChange={trackUpload}
            />
          )}
        </Field>

        <Field
          label='Tên liệu trình (Tiếng Việt)'
          required
          error={errors.titleVietnamese}
          hint='VD: Phục hồi da chuyên sâu'
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.titleVietnamese}
              maxLength={255}
              onChange={(event) => update('titleVietnamese', event.target.value)}
            />
          )}
        </Field>
        <Field label='Tên liệu trình (English)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.titleEnglish}
              maxLength={255}
              onChange={(event) => update('titleEnglish', event.target.value)}
            />
          )}
        </Field>

        <Field
          label='Kết quả nổi bật (Tiếng Việt)'
          required
          error={errors.resultVietnamese}
          hint='Dòng chữ lớn trên ảnh, VD: Nám mảng giảm 88%'
        >
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.resultVietnamese}
              maxLength={255}
              onChange={(event) => update('resultVietnamese', event.target.value)}
            />
          )}
        </Field>
        <Field label='Kết quả nổi bật (English)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.resultEnglish}
              maxLength={255}
              onChange={(event) => update('resultEnglish', event.target.value)}
            />
          )}
        </Field>

        <Field label='Mô tả ngắn (Tiếng Việt)' hint='Dòng chữ nhỏ dưới kết quả nổi bật.'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.summaryVietnamese}
              maxLength={500}
              onChange={(event) => update('summaryVietnamese', event.target.value)}
            />
          )}
        </Field>
        <Field label='Mô tả ngắn (English)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.summaryEnglish}
              maxLength={500}
              onChange={(event) => update('summaryEnglish', event.target.value)}
            />
          )}
        </Field>

        <div className='grid grid-cols-3 gap-4 sm:col-span-2'>
          <Field label='Số buổi' required error={errors.sessionCount}>
            {(id) => (
              <input
                id={id}
                type='number'
                min={1}
                max={999}
                className={inputClass}
                value={values.sessionCount}
                onChange={(event) => update('sessionCount', event.target.value)}
              />
            )}
          </Field>
          <Field label='Thời gian (tuần)' required error={errors.durationWeeks}>
            {(id) => (
              <input
                id={id}
                type='number'
                min={1}
                max={999}
                className={inputClass}
                value={values.durationWeeks}
                onChange={(event) => update('durationWeeks', event.target.value)}
              />
            )}
          </Field>
          <Field label='Thứ tự' error={errors.displayOrder} hint='Số nhỏ hiện trước.'>
            {(id) => (
              <input
                id={id}
                type='number'
                min={0}
                className={inputClass}
                value={values.displayOrder}
                onChange={(event) => update('displayOrder', event.target.value)}
              />
            )}
          </Field>
        </div>

        <div className='sm:col-span-2'>
          <Toggle
            label='Hiển thị trên trang chủ'
            description='Tắt để lưu nháp hoặc tạm ẩn kết quả mà không cần xóa.'
            checked={values.isActive}
            onChange={(checked) => update('isActive', checked)}
          />
        </div>
        <Field
          label='Ghi chú nội bộ'
          className='sm:col-span-2'
          hint='Không hiển thị trên website (VD: khách đã đồng ý dùng ảnh).'
        >
          {(id) => (
            <textarea
              id={id}
              rows={2}
              maxLength={1000}
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
