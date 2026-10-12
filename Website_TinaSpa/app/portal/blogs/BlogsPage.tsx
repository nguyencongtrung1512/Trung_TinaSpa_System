import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { Pagination } from '~/components/ui/Pagination'
import { useToast } from '~/components/ui/toast-view'
import { useSession } from '~/lib/auth'
import { formatPortalDate } from '~/portal/format'
import {
  PortalDialog,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import {
  blogApi,
  blogStatusMeta,
  formatBlogDate,
  type Blog,
  type BlogCategory,
  type BlogList,
  type BlogStatus
} from './blog.api'
import { BlogFormDialog } from './BlogFormDialog'
import { CategoryDialog } from './CategoryDialog'

type StatusTab = BlogStatus | 'all'
type Scope = 'mine' | 'all'

const PAGE_SIZE = 10

const tabs: readonly { readonly id: StatusTab; readonly label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'DRAFT', label: 'Bản nháp' },
  { id: 'PUBLISHED', label: 'Đã xuất bản' },
  { id: 'HIDDEN', label: 'Đã ẩn' }
]

const copy: Record<PortalRole, { title: string; description: string; empty: string }> = {
  staff: {
    title: 'Bài viết của tôi',
    description: 'Xem tất cả bài viết, viết bài mới (lưu ở dạng bản nháp) và chỉnh sửa bản nháp do bạn tạo. Quản lý sẽ xuất bản.',
    empty: 'Chưa có bài viết nào.'
  },
  manager: {
    title: 'Duyệt bài viết',
    description: 'Xem bài nhân viên gửi lên, chỉnh sửa và xuất bản hoặc ẩn bài.',
    empty: 'Chưa có bài viết nào.'
  },
  admin: {
    title: 'Bài viết',
    description: 'Danh sách toàn bộ bài viết. Quản trị chỉ có quyền xem.',
    empty: 'Chưa có bài viết nào.'
  }
}

interface StatusAction {
  readonly status: BlogStatus
  readonly label: string
  readonly icon: string
  readonly primary?: boolean
}

/** What a manager can do next with a post, per current status. */
const managerActions: Record<BlogStatus, readonly StatusAction[]> = {
  DRAFT: [{ status: 'PUBLISHED', label: 'Xuất bản', icon: 'publish', primary: true }],
  PUBLISHED: [
    { status: 'HIDDEN', label: 'Ẩn bài', icon: 'visibility_off' },
    { status: 'DRAFT', label: 'Về bản nháp', icon: 'undo' }
  ],
  HIDDEN: [
    { status: 'PUBLISHED', label: 'Xuất bản lại', icon: 'publish', primary: true },
    { status: 'DRAFT', label: 'Về bản nháp', icon: 'undo' }
  ]
}

const smallSolid =
  'inline-flex items-center gap-1.5 rounded-full bg-clinic px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-clinic-deep disabled:opacity-60'
const smallOutline =
  'inline-flex items-center gap-1.5 rounded-full border border-rose-soft bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-clinic hover:text-clinic disabled:opacity-60'

const proseClass =
  'text-sm leading-7 text-ink/90 [&_a]:text-clinic [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-rose-soft [&_blockquote]:pl-4 [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-canvas [&_pre]:p-3 [&_table]:w-full [&_td]:border [&_td]:border-rose-soft [&_td]:p-2 [&_th]:border [&_th]:border-rose-soft [&_th]:p-2 [&_ul]:list-disc'

function errorText(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback
}

export function BlogsPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const isManager = role === 'manager'
  const canWrite = role === 'staff' || isManager
  const text = copy[role]
  const toast = useToast()
  const currentUserID = useSession()?.user.userID

  const [tab, setTab] = useState<StatusTab>('all')
  // Staff start on their own posts and can switch to the whole system.
  const [scope, setScope] = useState<Scope>(role === 'staff' ? 'mine' : 'all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<BlogList>()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const [form, setForm] = useState<{ open: boolean; editingID: string | null }>({ open: false, editingID: null })
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [preview, setPreview] = useState<{ blog?: Blog; loading: boolean; error?: string; open: boolean }>({
    open: false,
    loading: false
  })
  const [pendingChange, setPendingChange] = useState<{ blog: Blog; action: StatusAction }>()
  const [changeBusy, setChangeBusy] = useState(false)
  const [changeError, setChangeError] = useState<string>()

  const showNotice = useCallback((message: string) => void toast.success(message), [toast])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    blogApi
      .list({
        status: tab === 'all' ? undefined : tab,
        mine: role === 'staff' && scope === 'mine' ? true : undefined,
        search: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE
      })
      .then((next) => {
        if (cancelled) return
        setResult(next)
        setError(undefined)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorText(reason, 'Không tải được danh sách bài viết.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tab, scope, role, debouncedSearch, page, reloadKey])

  useEffect(() => {
    let cancelled = false
    blogApi
      .listCategories()
      .then((items) => {
        if (!cancelled) setCategories(items.filter((item) => item.isActive))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const reload = () => setReloadKey((key) => key + 1)
  const closeForm = useCallback(() => setForm((current) => ({ ...current, open: false })), [])
  const closePreview = useCallback(() => setPreview((current) => ({ ...current, open: false })), [])
  const closeChange = useCallback(() => setPendingChange(undefined), [])

  async function openPreview(blog: Blog) {
    setPreview({ open: true, loading: true, blog })
    try {
      const full = await blogApi.get(blog.blogID)
      setPreview({ open: true, loading: false, blog: full })
    } catch (reason) {
      setPreview({ open: true, loading: false, blog, error: errorText(reason, 'Không tải được nội dung bài viết.') })
    }
  }

  async function confirmChange() {
    if (!pendingChange) return
    setChangeBusy(true)
    setChangeError(undefined)
    try {
      await blogApi.update(pendingChange.blog.blogID, { status: pendingChange.action.status })
      showNotice(`Đã chuyển "${pendingChange.blog.nameVietnamese}" sang "${blogStatusMeta[pendingChange.action.status].label}".`)
      setPendingChange(undefined)
      reload()
    } catch (reason) {
      const message = errorText(reason, 'Không đổi được trạng thái bài viết.')
      setChangeError(message)
      toast.error('Không đổi được trạng thái', message)
    } finally {
      setChangeBusy(false)
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel[role]}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>{text.title}</h1>
          <p className='mt-1 max-w-2xl text-sm text-muted'>{text.description}</p>
        </div>
        {canWrite ? (
          <div className='flex flex-wrap gap-2 self-start lg:self-auto'>
            {isManager ? (
              <button type='button' className={outlineButtonClass} onClick={() => setCategoryOpen(true)}>
                <Icon name='category' size={18} />
                Thêm danh mục
              </button>
            ) : null}
            <button
              type='button'
              className={primaryButtonClass}
              onClick={() => setForm({ open: true, editingID: null })}
            >
              <Icon name='edit_square' size={18} />
              Viết bài mới
            </button>
          </div>
        ) : null}
      </header>

      <section className={`${portalCardClass} mt-4 p-3 sm:p-4`} aria-label='Danh sách bài viết'>
        {role === 'staff' ? (
          <div
            role='group'
            aria-label='Phạm vi bài viết'
            className='mb-3 inline-flex rounded-full bg-canvas p-1'
          >
            {(
              [
                { id: 'mine', label: 'Bài của tôi', icon: 'person' },
                { id: 'all', label: 'Toàn hệ thống', icon: 'public' }
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type='button'
                aria-pressed={scope === item.id}
                onClick={() => {
                  setScope(item.id)
                  setPage(1)
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  scope === item.id ? 'bg-clinic text-white shadow-sm' : 'text-ink/70 hover:text-clinic'
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className='flex flex-col gap-3 px-1 pb-3 lg:flex-row lg:items-center'>
          <div role='tablist' aria-label='Lọc theo trạng thái' className='flex flex-1 flex-wrap gap-1.5'>
            {tabs.map((item) => {
              const selected = tab === item.id
              return (
                <button
                  key={item.id}
                  type='button'
                  role='tab'
                  aria-selected={selected}
                  onClick={() => {
                    setTab(item.id)
                    setPage(1)
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition ${
                    selected ? 'bg-clinic text-white shadow-sm' : 'bg-canvas text-ink/70 hover:bg-mist hover:text-clinic'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <input
            type='search'
            className={`${inputClass} lg:max-w-xs`}
            placeholder='Tìm theo tiêu đề, tóm tắt...'
            aria-label='Tìm bài viết'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error ? (
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>
            <span>{error}</span>
            <button type='button' className='font-bold text-clinic' onClick={reload}>
              Thử lại
            </button>
          </div>
        ) : loading && !result ? (
          <p className='px-2 py-6 text-sm text-muted'>Đang tải...</p>
        ) : result && result.items.length === 0 ? (
          <div className='flex flex-col items-center gap-2 px-6 py-10 text-center'>
            <Icon name='article' size={32} className='text-clinic/60' />
            <p className='text-sm text-muted'>{text.empty}</p>
          </div>
        ) : (
          <ul className='divide-y divide-rose-soft/60'>
            <AnimatePresence initial={false}>
              {result?.items.map((blog) => {
                const meta = blogStatusMeta[blog.status]
                return (
                  <motion.li
                    key={blog.blogID}
                    layout
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex flex-wrap items-start gap-4 px-2 py-4'
                  >
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                        <h3 className='text-base font-extrabold text-ink'>{blog.nameVietnamese}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.className}`}
                        >
                          <Icon name={meta.icon} size={13} />
                          {meta.label}
                        </span>
                        {blog.isFeatured ? (
                          <span className='inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-0.5 text-[11px] font-bold text-clinic'>
                            <Icon name='star' size={13} />
                            Nổi bật
                          </span>
                        ) : null}
                      </div>
                      {blog.summary ? (
                        <p className='mt-1 line-clamp-2 text-sm leading-6 text-muted'>{blog.summary}</p>
                      ) : null}
                      <p className='mt-1.5 text-xs text-muted'>
                        {blog.category.nameVietnamese}
                        {blog.author ? ` · ${blog.author.fullName}` : ''}
                        {' · '}
                        {blog.status === 'PUBLISHED'
                          ? `Xuất bản ${formatBlogDate(blog.publishedAt)} · ${blog.viewCount} lượt xem`
                          : `Cập nhật ${formatBlogDate(blog.updatedAt)}`}
                      </p>
                    </div>

                    <div className='flex w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:flex-col sm:items-end'>
                      {isManager
                        ? managerActions[blog.status].map((action) => (
                            <button
                              key={action.status}
                              type='button'
                              className={action.primary ? smallSolid : smallOutline}
                              onClick={() => {
                                setChangeError(undefined)
                                setPendingChange({ blog, action })
                              }}
                            >
                              <Icon name={action.icon} size={16} />
                              {action.label}
                            </button>
                          ))
                        : null}
                      {isManager || (role === 'staff' && blog.status === 'DRAFT' && blog.author?.userID === currentUserID) ? (
                        <button
                          type='button'
                          className={smallOutline}
                          onClick={() => setForm({ open: true, editingID: blog.blogID })}
                        >
                          <Icon name='edit' size={16} />
                          Sửa
                        </button>
                      ) : null}
                      <button type='button' className={smallOutline} onClick={() => void openPreview(blog)}>
                        <Icon name='visibility' size={16} />
                        Xem
                      </button>
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>
        )}

        {result ? (
          <Pagination
            className='mt-2 px-1 pt-3'
            page={page}
            pageSize={result.pageSize}
            total={result.total}
            disabled={loading}
            onPageChange={setPage}
            labels={{ summary: ({ total }) => `${total} bài viết` }}
          />
        ) : null}
      </section>

      <BlogFormDialog
        open={form.open}
        editingID={form.editingID}
        categories={categories}
        canFeature={isManager}
        onClose={closeForm}
        onSaved={(message) => {
          closeForm()
          showNotice(message)
          setPage(1)
          reload()
        }}
      />

      <CategoryDialog
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        onSaved={(message) => {
          setCategoryOpen(false)
          showNotice(message)
          reload()
        }}
      />

      <PortalDialog
        open={preview.open}
        title={preview.blog?.nameVietnamese ?? 'Bài viết'}
        description={
          preview.blog
            ? `${preview.blog.category.nameVietnamese} · ${blogStatusMeta[preview.blog.status].label}${
                preview.blog.author ? ` · ${preview.blog.author.fullName}` : ''
              }`
            : undefined
        }
        onClose={closePreview}
        footer={
          <button type='button' className={outlineButtonClass} onClick={closePreview}>
            Đóng
          </button>
        }
      >
        {preview.loading ? (
          <p className='text-sm text-muted'>Đang tải nội dung...</p>
        ) : (
          <>
            {preview.error ? <p className='mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>{preview.error}</p> : null}
            {preview.blog?.summary ? <p className='mb-3 text-sm font-semibold text-ink'>{preview.blog.summary}</p> : null}
            {/* `content` is sanitized by the API (sanitizeBlogHtml) before it is stored. */}
            {preview.blog?.content ? (
              <div className={proseClass} dangerouslySetInnerHTML={{ __html: preview.blog.content }} />
            ) : (
              <p className='text-sm text-muted'>Bài viết chưa có nội dung.</p>
            )}
          </>
        )}
      </PortalDialog>

      <PortalDialog
        open={pendingChange !== undefined}
        size='md'
        title={pendingChange ? pendingChange.action.label : ''}
        onClose={closeChange}
        onSubmit={() => void confirmChange()}
        footer={
          <>
            <button type='button' className={outlineButtonClass} onClick={closeChange}>
              Hủy
            </button>
            <button type='submit' className={primaryButtonClass} disabled={changeBusy}>
              <Icon name={pendingChange?.action.icon ?? 'check'} size={18} />
              {changeBusy ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </>
        }
      >
        {pendingChange ? (
          <p className='text-sm leading-6 text-ink/80'>
            {pendingChange.action.status === 'PUBLISHED'
              ? `Xuất bản "${pendingChange.blog.nameVietnamese}"? Bài sẽ hiển thị công khai trên website.`
              : pendingChange.action.status === 'HIDDEN'
                ? `Ẩn "${pendingChange.blog.nameVietnamese}"? Bài sẽ không còn hiển thị công khai.`
                : `Chuyển "${pendingChange.blog.nameVietnamese}" về bản nháp?`}
          </p>
        ) : null}
        {changeError ? <p className='mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>{changeError}</p> : null}
      </PortalDialog>
    </motion.div>
  )
}
