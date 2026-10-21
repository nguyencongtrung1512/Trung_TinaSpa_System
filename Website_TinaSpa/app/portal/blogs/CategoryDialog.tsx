import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import {
  Field,
  FormError,
  PortalDialog,
  Toggle,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { toSlug } from '~/portal/manager/services/catalog.api'
import { blogApi, type BlogCategory, type BlogCategoryPayload } from './blog.api'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

interface CategoryValues {
  readonly nameVietnamese: string
  readonly nameEnglish: string
  readonly slug: string
  readonly description: string
  readonly displayOrder: string
  readonly isActive: boolean
  readonly note: string
}

type CategoryErrors = Partial<Record<keyof CategoryValues, string>>

function toValues(category?: BlogCategory): CategoryValues {
  return {
    nameVietnamese: category?.nameVietnamese ?? '',
    nameEnglish: category?.nameEnglish ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    displayOrder: String(category?.displayOrder ?? 0),
    isActive: category?.isActive ?? true,
    note: category?.note ?? ''
  }
}

function validate(values: CategoryValues): CategoryErrors {
  const errors: CategoryErrors = {}
  if (values.nameVietnamese.trim().length < 2) errors.nameVietnamese = 'Nhập tên danh mục (ít nhất 2 ký tự).'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.'
  if (!/^\d+$/.test(values.displayOrder)) errors.displayOrder = 'Thứ tự là số nguyên không âm.'
  return errors
}

const blank = (value: string) => value.trim() || null

function toPayload(values: CategoryValues): BlogCategoryPayload {
  return {
    nameVietnamese: values.nameVietnamese.trim(),
    nameEnglish: blank(values.nameEnglish),
    slug: values.slug,
    description: blank(values.description),
    displayOrder: Number(values.displayOrder),
    isActive: values.isActive,
    note: blank(values.note)
  }
}

/** Thêm mới khi không truyền `category`, ngược lại sửa danh mục đó. Mount lại (đổi `key`) mỗi lần mở. */
export function CategoryDialog({
  open,
  category,
  onClose,
  onSaved
}: {
  readonly open: boolean
  readonly category?: BlogCategory
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}) {
  const editing = category !== undefined
  const [values, setValues] = useState(() => toValues(category))
  const [errors, setErrors] = useState<CategoryErrors>({})
  const [slugTouched, setSlugTouched] = useState(editing)
  const [submitError, setSubmitError] = useState<string>()
  const [busy, setBusy] = useState(false)

  function update<K extends keyof CategoryValues>(field: K, value: CategoryValues[K]) {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'nameVietnamese' && !slugTouched ? { slug: toSlug(String(value)) } : {})
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
      if (category) {
        await blogApi.updateCategory(category.blogCategoryID, payload)
        onSaved(`Đã cập nhật danh mục "${payload.nameVietnamese}".`)
      } else {
        await blogApi.createCategory(payload)
        onSaved(`Đã thêm danh mục "${payload.nameVietnamese}".`)
      }
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Không lưu được danh mục.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={editing ? `Sửa danh mục ${category.nameVietnamese}` : 'Thêm danh mục bài viết'}
      description='Danh mục đang hiển thị sẽ xuất hiện trên trang Blog và trong form viết bài.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name={editing ? 'save' : 'add'} size={18} />
            {busy ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Thêm danh mục'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Tên (Tiếng Việt)' required error={errors.nameVietnamese}>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameVietnamese}
              maxLength={255}
              onChange={(event) => update('nameVietnamese', event.target.value)}
            />
          )}
        </Field>
        <Field label='Tên (English)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.nameEnglish}
              maxLength={255}
              onChange={(event) => update('nameEnglish', event.target.value)}
            />
          )}
        </Field>
        <Field label='Đường dẫn (slug)' required error={errors.slug} hint='VD: cham-soc-da'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={values.slug}
              maxLength={255}
              onChange={(event) => {
                setSlugTouched(true)
                update('slug', event.target.value.toLowerCase())
              }}
            />
          )}
        </Field>
        <Field label='Thứ tự hiển thị' error={errors.displayOrder} hint='Số nhỏ hiện trước.'>
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
        <Field label='Mô tả' className='sm:col-span-2'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              maxLength={2000}
              className={inputClass}
              value={values.description}
              onChange={(event) => update('description', event.target.value)}
            />
          )}
        </Field>
        <div className='sm:col-span-2'>
          <Toggle
            label='Hiển thị trên website'
            description='Tắt để ẩn danh mục khỏi trang Blog; bài viết cũ vẫn giữ nguyên.'
            checked={values.isActive}
            onChange={(checked) => update('isActive', checked)}
          />
        </div>
        <Field label='Ghi chú nội bộ' className='sm:col-span-2'>
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
