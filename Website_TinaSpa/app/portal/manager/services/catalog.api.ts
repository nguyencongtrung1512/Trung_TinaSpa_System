import { apiRequest } from '~/lib/api'

export type CatalogStatus = 'ACTIVE' | 'INACTIVE'

export interface CatalogCategory {
  readonly serviceCategoryID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly descriptionVietnamese: string | null
  readonly descriptionEnglish: string | null
  readonly descriptionCambodia: string | null
  readonly icon: string | null
  readonly image: string | null
  readonly imageAlt: string | null
  readonly isFeatured: boolean
  readonly isBookable: boolean
  readonly sortOrder: number
  readonly status: CatalogStatus
  readonly serviceCount: number
  readonly minPrice: number | null
  readonly note?: string | null
}

export interface CatalogService {
  readonly serviceID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly shortDescriptionVietnamese: string | null
  readonly shortDescriptionEnglish: string | null
  readonly shortDescriptionCambodia: string | null
  readonly descriptionVietnamese: string | null
  readonly descriptionEnglish: string | null
  readonly descriptionCambodia: string | null
  readonly price: number
  readonly durationMinutes: number | null
  readonly isBookable: boolean
  readonly sortOrder: number
  readonly status: CatalogStatus
  readonly category?: { readonly serviceCategoryID: string; readonly slug: string; readonly nameVietnamese: string }
  readonly note?: string | null
}

export type CategoryPayload = Omit<CatalogCategory, 'serviceCategoryID' | 'serviceCount' | 'minPrice'>

export type ServicePayload = Omit<CatalogService, 'serviceID' | 'category' | 'isBookable' | 'sortOrder'> & {
  readonly serviceCategoryID: string
}

export const catalogApi = {
  listCategories: () => apiRequest<CatalogCategory[]>('/service-categories/manage', { auth: true }),
  createCategory: (body: CategoryPayload) =>
    apiRequest<CatalogCategory>('/service-categories', { method: 'POST', body, auth: true }),
  updateCategory: (id: string, body: Partial<CategoryPayload>) =>
    apiRequest<CatalogCategory>(`/service-categories/${id}`, { method: 'PATCH', body, auth: true }),
  removeCategory: (id: string) => apiRequest<void>(`/service-categories/${id}`, { method: 'DELETE', auth: true }),

  listServices: () => apiRequest<CatalogService[]>('/services/manage', { auth: true }),
  createService: (body: ServicePayload) =>
    apiRequest<CatalogService>('/services', { method: 'POST', body, auth: true }),
  updateService: (id: string, body: Partial<ServicePayload>) =>
    apiRequest<CatalogService>(`/services/${id}`, { method: 'PATCH', body, auth: true }),
  removeService: (id: string) => apiRequest<void>(`/services/${id}`, { method: 'DELETE', auth: true })
}

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)}đ`
}

export function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll(/[đĐ]/g, 'd')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}
