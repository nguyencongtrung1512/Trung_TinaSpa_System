import { apiRequest } from '~/lib/api'
import type { CatalogCategory, CatalogService } from '~/portal/manager/services/catalog.api'

export type StaffCatalogCategory = Omit<CatalogCategory, 'note'>

/** Public service with its group summary (image is the group's, services have none). */
export type StaffCatalogService = Omit<CatalogService, 'note' | 'category'> & {
  readonly category?: {
    readonly serviceCategoryID: string
    readonly slug: string
    readonly nameVietnamese: string
    readonly image: string | null
    readonly imageAlt: string | null
  }
}

/** Read-only catalog for the staff desk: the same open services customers see on the website. */
export const staffCatalogApi = {
  categories: () => apiRequest<StaffCatalogCategory[]>('/service-categories'),
  services: () => apiRequest<StaffCatalogService[]>('/services'),
  service: (slug: string) => apiRequest<StaffCatalogService>(`/services/${encodeURIComponent(slug)}`),
  servicesInCategory: (categorySlug: string) =>
    apiRequest<StaffCatalogService[]>(`/services?category=${encodeURIComponent(categorySlug)}`)
}

export function formatDuration(minutes: number | null) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours > 0 ? `${hours} giờ${rest ? ` ${rest} phút` : ''}` : `${rest} phút`
}
