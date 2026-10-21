import { useEffect, useState } from 'react'
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
import { blogApi, type Blog, type BlogCategory, type BlogPayload } from './blog.api'
import { Select } from '~/components/ui/Select'

interface FormValues {
  readonly nameVietnamese: string
  readonly nameEnglish: string
  readonly blogCategoryID: string
  readonly slug: string
  readonly summary: string
  readonly content: string
  readonly thumbnailURL: string
  readonly metaTitle: string
  readonly metaDescription: string
  readonly isFeatured: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const emptyValues: FormValues = {
  nameVietnamese: '',
  nameEnglish: '',
  blogCategoryID: '',
  slug: '',
  summary: '',
  content: '',
  thumbnailURL: '',
  metaTitle: '',
  metaDescription: '',
  isFeatured: false
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SAFE_URL_PATTERN = /^(https:\/\/\S+|\/(?!\/)\S*)$/

function fromBlog(blog: Blog): FormValues {
  return {
    nameVietnamese: blog.nameVietnamese,
    nameEnglish: blog.nameEnglish ?? '',
    blogCategoryID: blog.category.blogCategoryID,
    slug: blog.slug,
    summary: blog.summary ?? '',
    content: blog.content ?? '',
    thumbnailURL: blog.thumbnailURL ?? '',
    metaTitle: blog.metaTitle ?? '',
    metaDescription: blog.metaDescription ?? '',
    isFeatured: blog.isFeatured
  }
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (values.nameVietnamese.trim().length < 2) errors.nameVietnamese = 'Nhập tiêu đề (ít nhất 2 ký tự).'
  if (!values.blogCategoryID) errors.blogCategoryID = 'Chọn danh mục.'
  if (!SLUG_PATTERN.test(values.slug)) errors.slug = 'Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.'
  if (values.thumbnailURL.trim() && !SAFE_URL_PATTERN.test(values.thumbnailURL.trim())) {
    errors.thumbnailURL = 'Chỉ nhận đường dẫn https:// hoặc đường dẫn nội bộ bắt đầu bằng /.'
  }
  if (values.content.length > 80_000) errors.content = 'Nội dung tối đa 80.000 ký tự.'
  if (values.metaDescription.length > 320) errors.metaDescription = 'Mô tả SEO tối đa 320 ký tự.'
  return errors
}

const blank = (value: string) => value.trim() || null

export interface BlogFormDialogProps {
  readonly open: boolean
  /** Post being edited; null creates a new draft. */
  readonly editingID: string | null
  readonly categories: readonly BlogCategory[]
  /** Managers may also feature a post. */
  readonly canFeature: boolean
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}

export function BlogFormDialog({ open, editingID, categories, canFeature, onClose, onSaved }: BlogFormDialogProps) {
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  useEffect(() => {
    if (!open) return
    setErrors({})
    setSubmitError(undefined)
    if (!editingID) {
      setValues(emptyValues)
      setSlugTouched(false)
      return
    }
    let cancelled = false
    setLoading(true)
    blogApi
      .get(editingID)
      .then((blog) => {
        if (cancelled) return
        setValues(fromBlog(blog))
        setSlugTouched(true)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setSubmitError(reason instanceof Error ? reason.message : 'Không tải được bài viết.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, editingID])

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => {
      const next = { ...current, [field]: value }
      return field === 'nameVietnamese' && !slugTouched ? { ...next, slug: toSlug(String(value)) } : next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function submit() {
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    const payload: BlogPayload = {
      nameVietnamese: values.nameVietnamese.trim(),
      nameEnglish: blank(values.nameEnglish),
      blogCategoryID: values.blogCategoryID,
      slug: values.slug,
      summary: blank(values.summary),
      content: blank(values.content),
      thumbnailURL: blank(values.thumbnailURL),
      metaTitle: blank(values.metaTitle),
      metaDescription: blank(values.metaDescription),
      // Only managers send isFeatured; the server rejects it from staff.
      ...(canFeature ? { isFeatured: values.isFeatured } : {})
    }

    setBusy(true)
    setSubmitError(undefined)
    try {
      if (editingID) await blogApi.update(editingID, payload)
      else await blogApi.create(payload)
      onSaved(editingID ? 'Đã lưu bài viết.' : 'Đã lưu bài viết ở trạng thái bản nháp.')
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'Không lưu được bài viết.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      title={editingID ? 'Sửa bài viết' : 'Viết bài mới'}
      description='Bài viết được lưu ở trạng thái bản nháp. Quản lý sẽ xem và xuất bản.'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy || loading}>
            <Icon name='save' size={18} />
            {busy ? 'Đang lưu...' : 'Lưu bản nháp'}
          </button>
        </>
      }
    >
      <FormError message={submitError} />
      {loading ? (
        <p className='text-sm text-muted'>Đang tải bài viết...</p>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Tiêu đề (Tiếng Việt)' required error={errors.nameVietnamese} className='sm:col-span-2'>
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
          <Field label='Tiêu đề (English)' className='sm:col-span-2'>
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
          <Field
            label='Danh mục'
            required
            error={errors.blogCategoryID}
            hint={categories.length === 0 ? 'Chưa có danh mục. Hãy nhờ quản lý tạo danh mục trước.' : undefined}
          >
            {(id) => (
              <Select
                id={id}
                value={values.blogCategoryID}
                onChange={(value) => update('blogCategoryID', value)}
                placeholder='Chọn danh mục'
                options={categories.map((category) => ({
                  value: category.blogCategoryID,
                  label: category.nameVietnamese
                }))}
              />
            )}
          </Field>
          <Field label='Đường dẫn (slug)' required error={errors.slug} hint='Tự tạo từ tiêu đề, có thể chỉnh.'>
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
          <Field label='Tóm tắt' className='sm:col-span-2'>
            {(id) => (
              <textarea
                id={id}
                rows={2}
                className={inputClass}
                value={values.summary}
                maxLength={2000}
                onChange={(event) => update('summary', event.target.value)}
              />
            )}
          </Field>
          <Field
            label='Nội dung (HTML)'
            error={errors.content}
            hint='Máy chủ tự loại bỏ script, iframe, style và thuộc tính nguy hiểm. Chỉ giữ thẻ định dạng thông thường.'
            className='sm:col-span-2'
          >
            {(id) => (
              <textarea
                id={id}
                rows={10}
                spellCheck={false}
                className={`${inputClass} font-mono text-xs`}
                value={values.content}
                onChange={(event) => update('content', event.target.value)}
                placeholder='<h2>Tiêu đề phần</h2><p>Nội dung...</p>'
              />
            )}
          </Field>
          <Field label='Ảnh đại diện (URL)' error={errors.thumbnailURL} className='sm:col-span-2'>
            {(id) => (
              <input
                id={id}
                className={inputClass}
                value={values.thumbnailURL}
                onChange={(event) => update('thumbnailURL', event.target.value)}
                placeholder='https://... hoặc /images/...'
              />
            )}
          </Field>
          <Field label='Tiêu đề SEO'>
            {(id) => (
              <input
                id={id}
                className={inputClass}
                value={values.metaTitle}
                maxLength={255}
                onChange={(event) => update('metaTitle', event.target.value)}
              />
            )}
          </Field>
          <Field label='Mô tả SEO' error={errors.metaDescription}>
            {(id) => (
              <input
                id={id}
                className={inputClass}
                value={values.metaDescription}
                maxLength={320}
                onChange={(event) => update('metaDescription', event.target.value)}
              />
            )}
          </Field>
          {canFeature ? (
            <div className='sm:col-span-2'>
              <Toggle
                label='Bài viết nổi bật'
                description='Hiển thị ưu tiên khi bài được xuất bản.'
                checked={values.isFeatured}
                onChange={(value) => update('isFeatured', value)}
              />
            </div>
          ) : null}
        </div>
      )}
    </PortalDialog>
  )
}
