import { apiRequest } from '~/lib/api'

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'
export type UserGender = 'MALE' | 'FEMALE' | 'OTHER'

export interface PortalUser {
  readonly userID: string
  readonly phone: string
  readonly fullName: string
  readonly avatar: string | null
  readonly address: string | null
  readonly dateOfBirth: string | null
  readonly gender: UserGender | null
  readonly role: UserRole
  readonly isActive: boolean
  readonly mustChangePassword?: boolean
  readonly branchAID?: string | null
  readonly branchID: string | null
  readonly branchName?: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface UserListResult {
  readonly items: PortalUser[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly roleCounts: Partial<Record<UserRole, number>>
}

export interface UserListQuery {
  readonly search?: string
  readonly role?: UserRole
  readonly isActive?: boolean
  readonly branchID?: string
  readonly page?: number
  readonly pageSize?: number
}

export interface StaffPayload {
  readonly fullName: string
  readonly phone: string
  readonly password: string
  readonly gender: UserGender | null
  readonly dateOfBirth: string | null
  readonly address: string | null
  readonly avatar: string | null
  readonly note: string | null
  readonly branchID?: string
  readonly role?: 'STAFF' | 'MANAGER'
}

/** Sửa tài khoản nội bộ; trường undefined giữ nguyên, password bỏ trống để giữ mật khẩu cũ. */
export type StaffUpdatePayload = Partial<Omit<StaffPayload, 'role'>>

export const userRoleLabels: Record<UserRole, string> = {
  CUSTOMER: 'Khách hàng',
  STAFF: 'Nhân viên',
  MANAGER: 'Quản lý',
  ADMIN: 'Quản trị'
}

export const userGenderLabels: Record<UserGender, string> = {
  FEMALE: 'Nữ',
  MALE: 'Nam',
  OTHER: 'Khác'
}

export function ageFromDateOfBirth(dateOfBirth: string | null, today = new Date()) {
  if (!dateOfBirth) return null
  const [year, month, day] = dateOfBirth.split('-').map(Number)
  const hadBirthday = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day)
  return today.getFullYear() - year - (hadBirthday ? 0 : 1)
}

export function listUsers(query: UserListQuery) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return apiRequest<UserListResult>(`/users${search ? `?${search}` : ''}`, { auth: true })
}

export function createStaff(body: StaffPayload) {
  return apiRequest<PortalUser>('/users/staff', { method: 'POST', body, auth: true })
}

export function updateStaff(userID: string, body: StaffUpdatePayload) {
  return apiRequest<PortalUser>(`/users/${encodeURIComponent(userID)}`, { method: 'PATCH', body, auth: true })
}

export interface UserDetail {
  readonly user: PortalUser
  readonly stats: {
    /** Units of service (sum of quantity). */
    readonly serviceCount: number
    readonly serviceTotal: number
    readonly lastServiceAt: string | null
    readonly appointmentCount: number
    readonly completedAppointments: number
    readonly cancelledAppointments: number
  }
  /** Customer: services used. Staff/manager: services they recorded (with the customer). Latest 50. */
  readonly services: {
    readonly customerServiceID: string
    readonly serviceID: string
    readonly nameVietnamese: string
    readonly price: number
    readonly quantity: number
    readonly usedAt: string
    readonly staffNote: string | null
    readonly branchName: string | null
    readonly customer: { readonly userID: string; readonly fullName: string; readonly phone: string } | null
  }[]
  /** Customer: bookings made. Staff/manager: bookings they confirmed or served. Latest 50. */
  readonly appointments: {
    readonly appointmentID: string
    readonly customerName: string
    readonly phoneNumber: string
    readonly appointmentDate: string
    readonly appointmentTime: string
    readonly status: string
    readonly branchName: string
    readonly customerNote: string | null
    readonly serviceNote: string | null
  }[]
}

export function getUserDetail(userID: string) {
  return apiRequest<UserDetail>(`/users/${encodeURIComponent(userID)}/detail`, { auth: true })
}

export function deleteUser(userID: string) {
  return apiRequest<void>(`/users/${encodeURIComponent(userID)}`, { method: 'DELETE', auth: true })
}

export function setUserActive(userID: string, isActive: boolean) {
  return apiRequest<PortalUser>(`/users/${encodeURIComponent(userID)}/status`, {
    method: 'PATCH',
    body: { isActive },
    auth: true
  })
}
