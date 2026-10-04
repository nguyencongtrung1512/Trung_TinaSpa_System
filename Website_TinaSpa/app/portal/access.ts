import type { AuthSession } from '~/lib/auth'
import type { PortalRole } from '~/portal/types'

const portalByAuthRole = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff'
} as const

export function portalRoleFromSession(session: AuthSession | null): PortalRole | null {
  if (!session) return null

  const names = [session.user.role, ...session.roles]
  for (const name of names) {
    const portalRole = portalByAuthRole[name.toUpperCase() as keyof typeof portalByAuthRole]
    if (portalRole) return portalRole
  }

  return null
}

export function destinationForSession(session: AuthSession) {
  const role = portalRoleFromSession(session)
  return role ? `/portal/${role}` : '/'
}
