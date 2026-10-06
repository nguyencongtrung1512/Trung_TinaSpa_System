import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { Navigate, Outlet, useParams, useRoutes, type RouteObject } from 'react-router'
import { useSession } from '~/lib/auth'
import { AppointmentsPage } from '~/portal/appointments/AppointmentsPage'
import { PortalShell } from '~/portal/layout/PortalShell'
import { ManagerOverviewPage } from '~/portal/manager/ManagerOverviewPage'
import { ServiceCatalogPage } from '~/portal/manager/services/ServiceCatalogPage'
import { findNavItem } from '~/portal/navigation'
import { PortalProfilePage } from '~/portal/pages/PortalProfilePage'
import { PortalSectionPage } from '~/portal/pages/PortalSectionPage'
import { RoleHomePage } from '~/portal/pages/RoleHomePage'
import { portalRoleFromSession } from '~/portal/access'
import { StaffDeskPage } from '~/portal/staff/StaffDeskPage'
import type { PortalRole } from '~/portal/types'
import { UserListPage } from '~/portal/users/UserListPage'

function PortalSectionGate({ role }: { readonly role: PortalRole }) {
  const { section } = useParams()
  const item = findNavItem(role, `/portal/${role}/${section ?? ''}`)
  if (!item) return <Navigate to={`/portal/${role}`} replace />
  return <PortalSectionPage item={item} />
}

const homePages: Record<PortalRole, ReactNode> = {
  staff: <StaffDeskPage />,
  manager: <ManagerOverviewPage />,
  admin: <RoleHomePage role='admin' />
}

const sectionPages: Partial<Record<PortalRole, RouteObject[]>> = {
  staff: [{ path: 'lich-hen', element: <AppointmentsPage role='staff' /> }],
  manager: [
    { path: 'lich-hen', element: <AppointmentsPage role='manager' /> },
    { path: 'dich-vu', element: <ServiceCatalogPage role='manager' /> },
    {
      path: 'khach-hang',
      element: (
        <UserListPage
          role='manager'
          title='Khách hàng'
          description='Tài khoản khách hàng đã đăng ký trên website.'
          roles={['CUSTOMER']}
          entityLabel='khách hàng'
        />
      )
    },
    {
      path: 'nhan-vien',
      element: (
        <UserListPage
          role='manager'
          title='Nhân viên'
          description='Tài khoản chuyên viên và nhân viên của chi nhánh.'
          roles={['STAFF']}
          entityLabel='nhân viên'
          canCreateStaff
        />
      )
    }
  ],
  admin: [
    { path: 'lich-hen', element: <AppointmentsPage role='admin' /> },
    { path: 'dich-vu', element: <ServiceCatalogPage role='admin' /> },
    {
      path: 'nguoi-dung',
      element: (
        <UserListPage
          role='admin'
          title='Người dùng'
          description='Toàn bộ tài khoản khách hàng, nhân viên, quản lý và quản trị.'
          roles={['CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN']}
          entityLabel='người dùng'
          canCreateStaff
        />
      )
    }
  ]
}

function routesForRole(role: PortalRole): RouteObject[] {
  return [
    { index: true, element: <Navigate to={`/portal/${role}`} replace /> },
    {
      path: role,
      element: (
        <PortalShell role={role}>
          <Outlet />
        </PortalShell>
      ),
      children: [
        { index: true, element: homePages[role] },
        { path: 'ho-so', element: <PortalProfilePage role={role} /> },
        ...(sectionPages[role] ?? []),
        { path: ':section', element: <PortalSectionGate role={role} /> }
      ]
    },
    { path: '*', element: <Navigate to={`/portal/${role}`} replace /> }
  ]
}

export function useRouteElement() {
  const session = useSession()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const role = portalRoleFromSession(session)
  const routes = useMemo(() => (role ? routesForRole(role) : []), [role])
  const element = useRoutes(routes.length > 0 ? routes : [{ path: '*', element: null }])

  if (!mounted) return null
  if (!session) return <Navigate to='/login' replace />
  if (!role) return <Navigate to='/' replace />
  return element
}
