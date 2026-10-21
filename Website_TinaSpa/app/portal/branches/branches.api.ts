import { apiRequest } from '~/lib/api'
import type { Branch } from '~/lib/booking'

export type BranchStatus = 'ACTIVE' | 'INACTIVE'

/** Chi nhánh kèm số tài khoản và lịch hẹn sắp tới; chỉ ADMIN nhận được. */
export interface ManagedBranch extends Branch {
  readonly status: BranchStatus
  readonly sortOrder: number
  readonly note: string | null
  readonly managerCount: number
  readonly staffCount: number
  readonly customerCount: number
  readonly upcomingAppointments: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface BranchPayload {
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly slug: string
  readonly addressVietnamese: string | null
  readonly addressEnglish: string | null
  readonly hotline: string | null
  readonly openTime: string
  readonly closeTime: string
  readonly sortOrder: number
  readonly status: BranchStatus
  readonly note: string | null
}

export const branchesApi = {
  list: () => apiRequest<ManagedBranch[]>('/branches/manage', { auth: true }),
  create: (body: BranchPayload) => apiRequest<ManagedBranch>('/branches', { method: 'POST', body, auth: true }),
  update: (branchID: string, body: Partial<BranchPayload>) =>
    apiRequest<ManagedBranch>(`/branches/${encodeURIComponent(branchID)}`, { method: 'PATCH', body, auth: true }),
  remove: (branchID: string) =>
    apiRequest<void>(`/branches/${encodeURIComponent(branchID)}`, { method: 'DELETE', auth: true })
}
