import { useEffect, useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import {
  Field,
  FormError,
  PortalDialog,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { toSlug } from '~/portal/manager/services/catalog.api'
import { blogApi } from './blog.api'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function CategoryDialog({
  open,
  onClose,
  onSaved
}: {
  readonly open: boolean
  readonly onClose: () => void
  readonly onSaved: (message: string) => void
}) {
  const [nameVietnamese, setNameVietnamese] = useState('')
  const [nameEnglish, setNameEnglish] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setNameVietnamese('')
    setNameEnglish('')
    setSlug('')
    setSlugTouched(false)
    setError(undefined)
  }, [open])

  async function submit() {
    if (nameVietnamese.trim().length < 2) return setError('Nhập tên danh mục (ít nhất 2 ký tự).')
    if (!SLUG_PATTERN.test(slug)) return setError('Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.')
    setBusy(true)
    setError(undefined)
    try {
      await blogApi.createCategory({
        nameVietnamese: nameVietnamese.trim(),
        nameEnglish: nameEnglish.trim() || null,
        slug
      })
      onSaved(`Đã thêm danh mục "${nameVietnamese.trim()}".`)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thêm được danh mục.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalDialog
      open={open}
      size='md'
      title='Thêm danh mục bài viết'
      onClose={onClose}
      onSubmit={() => void submit()}
      footer={
        <>
          <button type='button' className={outlineButtonClass} onClick={onClose}>
            Hủy
          </button>
          <button type='submit' className={primaryButtonClass} disabled={busy}>
            <Icon name='add' size={18} />
            {busy ? 'Đang lưu...' : 'Thêm danh mục'}
          </button>
        </>
      }
    >
      <FormError message={error} />
      <div className='space-y-4'>
        <Field label='Tên (Tiếng Việt)' required>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={nameVietnamese}
              maxLength={255}
              onChange={(event) => {
                setNameVietnamese(event.target.value)
                if (!slugTouched) setSlug(toSlug(event.target.value))
              }}
            />
          )}
        </Field>
        <Field label='Tên (English)'>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={nameEnglish}
              maxLength={255}
              onChange={(event) => setNameEnglish(event.target.value)}
            />
          )}
        </Field>
        <Field label='Đường dẫn (slug)' required>
          {(id) => (
            <input
              id={id}
              className={inputClass}
              value={slug}
              maxLength={255}
              onChange={(event) => {
                setSlugTouched(true)
                setSlug(event.target.value.toLowerCase())
              }}
            />
          )}
        </Field>
      </div>
    </PortalDialog>
  )
}
