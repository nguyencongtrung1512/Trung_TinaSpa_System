import { apiRequest } from '~/lib/api'
import { loadSession, saveSession, type AuthUser } from '~/lib/auth'

export interface ProfileResponse {
  readonly user: AuthUser
  readonly roles: string[]
}

export interface ProfilePayload {
  readonly fullName: string
  readonly gender: AuthUser['gender']
  readonly dateOfBirth: string | null
  readonly address: string | null
  readonly avatar: string | null
}

function syncSession(profile: ProfileResponse) {
  const session = loadSession()
  if (session) saveSession({ ...session, user: profile.user, roles: profile.roles })
  return profile
}

export interface UsedServiceRecord {
  readonly customerServiceID: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly price: number
  readonly quantity: number
  readonly usedAt: string
  readonly staffNote: string | null
}

export interface UsedServiceList {
  readonly items: UsedServiceRecord[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

export function fetchMyServices(page: number, pageSize = 10) {
  return apiRequest<UsedServiceList>(`/auth/me/services?page=${page}&pageSize=${pageSize}`, { auth: true })
}

export function changeMyPassword(body: { currentPassword: string; newPassword: string }) {
  return apiRequest<ProfileResponse>('/auth/change-password', { method: 'POST', body, auth: true }).then(syncSession)
}

export function fetchMyProfile() {
  return apiRequest<ProfileResponse>('/auth/me', { auth: true }).then(syncSession)
}

export function updateMyProfile(body: ProfilePayload) {
  return apiRequest<ProfileResponse>('/auth/me', { method: 'PATCH', body, auth: true }).then(syncSession)
}
