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
}

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
