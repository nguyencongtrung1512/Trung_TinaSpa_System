import { apiRequest } from '~/lib/api'
import type { CatalogService } from '~/portal/manager/services/catalog.api'
import type { PortalUser } from '~/portal/users/users.api'

export interface CustomerServiceRecord {
  readonly customerServiceID: string
  readonly serviceID: string
  readonly serviceSlug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly price: number
  readonly quantity: number
  readonly usedAt: string
  readonly staffNote: string | null
  readonly createdAt: string
}

export interface CustomerServiceList {
  readonly items: CustomerServiceRecord[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

export interface CustomerLookup {
  readonly exists: boolean
  readonly customer: PortalUser | null
  readonly suggestedName: string | null
  readonly recentAppointments: readonly {
    readonly appointmentID: string
    readonly customerName: string
    readonly appointmentDate: string
    readonly appointmentTime: string
    readonly status: string
  }[]
}

export interface ServiceItemPayload {
  readonly serviceID: string
  readonly quantity: number
  readonly staffNote: string | null
}

export const customerServicesApi = {
  lookup: (phone: string) =>
    apiRequest<CustomerLookup>(`/customers/lookup?phone=${encodeURIComponent(phone)}`, { auth: true }),
  createCustomer: (body: { phone: string; fullName: string }) =>
    apiRequest<PortalUser>('/customers', { method: 'POST', body, auth: true }),
  list: (userID: string, page = 1, pageSize = 20) =>
    apiRequest<CustomerServiceList>(`/customers/${userID}/services?page=${page}&pageSize=${pageSize}`, {
      auth: true
    }),
  add: (userID: string, body: { items: readonly ServiceItemPayload[]; usedAt?: string }) =>
    apiRequest<CustomerServiceRecord[]>(`/customers/${userID}/services`, { method: 'POST', body, auth: true }),
  update: (id: string, body: { quantity?: number; usedAt?: string; staffNote?: string | null }) =>
    apiRequest<CustomerServiceRecord>(`/customer-services/${id}`, { method: 'PATCH', body, auth: true }),
  remove: (id: string) => apiRequest<void>(`/customer-services/${id}`, { method: 'DELETE', auth: true }),
  /** Active services staff can pick from (public catalog endpoint, open to every staff role). */
  listCatalog: () => apiRequest<CatalogService[]>('/services')
}

/** Strips separators so "0901 234 567" and "+84901234567" both pass the server pattern. */
export function cleanPhone(value: string) {
  return value.replaceAll(/[\s.\-()]/g, '')
}

export const PHONE_PATTERN = /^(0|\+84)\d{8,10}$/
