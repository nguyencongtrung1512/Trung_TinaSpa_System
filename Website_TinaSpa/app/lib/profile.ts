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

export function fetchMyProfile() {
  return apiRequest<ProfileResponse>('/auth/me', { auth: true }).then(syncSession)
}

export function updateMyProfile(body: ProfilePayload) {
  return apiRequest<ProfileResponse>('/auth/me', { method: 'PATCH', body, auth: true }).then(syncSession)
}
