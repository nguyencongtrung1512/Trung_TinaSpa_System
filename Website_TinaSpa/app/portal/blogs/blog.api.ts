import { apiRequest } from '~/lib/api'

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN'

export const blogStatusMeta: Record<BlogStatus, { readonly label: string; readonly icon: string; readonly className: string }> = {
  DRAFT: { label: 'Bản nháp', icon: 'edit_note', className: 'bg-amber-50 text-amber-700' },
  PUBLISHED: { label: 'Đã xuất bản', icon: 'check_circle', className: 'bg-emerald-50 text-emerald-700' },
  HIDDEN: { label: 'Đã ẩn', icon: 'visibility_off', className: 'bg-canvas text-muted' }
}

export interface BlogCategory {
  readonly blogCategoryID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly isActive: boolean
  readonly blogCount: number
}

export interface Blog {
  readonly blogID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly summary: string | null
  /** Sanitized HTML (server side); only returned by the single-post endpoint. */
  readonly content?: string | null
  readonly thumbnailURL: string | null
  readonly status: BlogStatus
  readonly publishedAt: string | null
  readonly isFeatured: boolean
  readonly viewCount: number
  readonly metaTitle: string | null
  readonly metaDescription: string | null
  readonly category: { readonly blogCategoryID: string; readonly nameVietnamese: string }
  readonly author: { readonly userID: string; readonly fullName: string } | null
  readonly createdAt?: string
  readonly updatedAt?: string
}

export interface BlogList {
  readonly items: Blog[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

export interface BlogPayload {
  readonly nameVietnamese?: string
  readonly nameEnglish?: string | null
  readonly blogCategoryID?: string
  readonly slug?: string
  readonly summary?: string | null
  readonly content?: string | null
  readonly thumbnailURL?: string | null
  readonly status?: BlogStatus
  readonly isFeatured?: boolean
  readonly metaTitle?: string | null
  readonly metaDescription?: string | null
}

export interface BlogQuery {
  readonly status?: BlogStatus
  /** Only posts written by the signed-in user. */
  readonly mine?: boolean
  readonly search?: string
  readonly page?: number
  readonly pageSize?: number
}

export const blogApi = {
  list: (query: BlogQuery) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value))
    }
    const search = params.toString()
    return apiRequest<BlogList>(`/blogs/manage${search ? `?${search}` : ''}`, { auth: true })
  },
  get: (blogID: string) => apiRequest<Blog>(`/blogs/manage/${blogID}`, { auth: true }),
  create: (body: BlogPayload) => apiRequest<Blog>('/blogs', { method: 'POST', body, auth: true }),
  update: (blogID: string, body: BlogPayload) =>
    apiRequest<Blog>(`/blogs/${blogID}`, { method: 'PATCH', body, auth: true }),
  listCategories: () => apiRequest<BlogCategory[]>('/blog-categories/manage', { auth: true }),
  createCategory: (body: { nameVietnamese: string; nameEnglish?: string | null; slug: string }) =>
    apiRequest<BlogCategory>('/blog-categories', { method: 'POST', body, auth: true })
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export function formatBlogDate(iso: string | null | undefined) {
  return iso ? dateFormatter.format(new Date(iso)) : '—'
}
