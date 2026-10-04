export const portalRoles = ['staff', 'manager', 'admin'] as const

export type PortalRole = (typeof portalRoles)[number]

export interface PortalActor {
  readonly name: string
  readonly title: string
  readonly initials: string
  readonly branch: string
}

export interface PortalAction {
  readonly label: string
  readonly icon: string
  readonly to: string
  readonly tone: 'outline' | 'solid'
}

export interface PortalNavItem {
  readonly label: string
  readonly icon: string
  readonly to: string
  readonly summary: string
  /** Số đếm, nhãn ngắn (vd "3 chờ"), hoặc 'dot' cho chấm báo. */
  readonly badge?: number | string
}

export interface PortalNavGroup {
  readonly label: string
  readonly items: readonly PortalNavItem[]
}

export function isPortalRole(value: string | undefined): value is PortalRole {
  return portalRoles.some((role) => role === value)
}
