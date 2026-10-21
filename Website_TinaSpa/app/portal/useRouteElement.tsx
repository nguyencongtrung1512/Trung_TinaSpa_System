import { useMemo, useSyncExternalStore, type ReactNode } from 'react'
import { Navigate, Outlet, useParams, useRoutes, type RouteObject } from 'react-router'
import { useSession } from '~/lib/auth'
import { AppointmentsPage } from '~/portal/appointments/AppointmentsPage'
import { BranchesPage } from '~/portal/branches/BranchesPage'
import { CustomerServicePage } from '~/portal/customer-services/CustomerServicePage'
import { BlogCategoriesPage } from '~/portal/blogs/BlogCategoriesPage'
import { BlogsPage } from '~/portal/blogs/BlogsPage'
import { ProductCategoriesPage } from '~/portal/manager/products/ProductCategoriesPage'
import { ProductDetailPage } from '~/portal/manager/products/ProductDetailPage'
import { ProductManagementPage } from '~/portal/manager/products/ProductManagementPage'
import { PortalShell } from '~/portal/layout/PortalShell'
import { ManagerOverviewPage } from '~/portal/manager/ManagerOverviewPage'
import { ServiceCatalogPage } from '~/portal/manager/services/ServiceCatalogPage'
import { ServiceCategoriesPage } from '~/portal/manager/services/ServiceCategoriesPage'
import { findNavItem } from '~/portal/navigation'
import { PortalProfilePage } from '~/portal/pages/PortalProfilePage'
import { PortalSectionPage } from '~/portal/pages/PortalSectionPage'
import { RoleHomePage } from '~/portal/pages/RoleHomePage'
import { SettingsPage } from '~/portal/settings/SettingsPage'
import { portalRoleFromSession } from '~/portal/access'
import { StaffDeskPage } from '~/portal/staff/StaffDeskPage'
import { StaffServiceDetailPage } from '~/portal/staff/StaffServiceDetailPage'
import { StaffServicesPage } from '~/portal/staff/StaffServicesPage'
import type { PortalRole } from '~/portal/types'
import { UserDetailPage } from '~/portal/users/UserDetailPage'
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
  staff: [
    { path: 'appointments', element: <AppointmentsPage role='staff' /> },
    {
      path: 'customers',
      element: (
        <UserListPage
          role='staff'
          title='Khách hàng'
          description='Khách hàng đặt lịch hoặc trực thuộc khu vực của bạn.'
          roles={['CUSTOMER']}
          entityLabel='khách hàng'
        />
      )
    },
    {
      path: 'customers/:userID',
      element: <UserDetailPage role='staff' backTo='/portal/staff/customers' backLabel='Khách hàng' />
    },
    { path: 'customer-services', element: <CustomerServicePage role='staff' /> },
    { path: 'articles', element: <BlogsPage role='staff' /> },
    { path: 'services', element: <StaffServicesPage /> },
    { path: 'services/:slug', element: <StaffServiceDetailPage /> },
    { path: 'products', element: <ProductManagementPage role='staff' /> },
    { path: 'products/:productID', element: <ProductDetailPage role='staff' /> }
  ],
  manager: [
    { path: 'appointments', element: <AppointmentsPage role='manager' /> },
    { path: 'customer-services', element: <CustomerServicePage role='manager' /> },
    {
      path: 'customers/:userID',
      element: <UserDetailPage role='manager' backTo='/portal/manager/customers' backLabel='Khách hàng' />
    },
    {
      path: 'staff/:userID',
      element: <UserDetailPage role='manager' backTo='/portal/manager/staff' backLabel='Nhân viên' />
    },
    { path: 'article-review', element: <BlogsPage role='manager' /> },
    { path: 'blog-categories', element: <BlogCategoriesPage role='manager' /> },
    { path: 'services', element: <ServiceCatalogPage role='manager' /> },
    { path: 'service-categories', element: <ServiceCategoriesPage role='manager' /> },
    { path: 'products', element: <ProductManagementPage role='manager' /> },
    { path: 'products/:productID', element: <ProductDetailPage role='manager' /> },
    { path: 'product-categories', element: <ProductCategoriesPage role='manager' /> },
    {
      path: 'customers',
      element: (
        <UserListPage
          role='manager'
          title='Khách hàng'
          description='Khách hàng đặt lịch hoặc trực thuộc khu vực bạn quản lý.'
          roles={['CUSTOMER']}
          entityLabel='khách hàng'
          canManage
        />
      )
    },
    {
      path: 'staff',
      element: (
        <UserListPage
          role='manager'
          title='Nhân viên'
          description='Tài khoản chuyên viên và nhân viên của chi nhánh.'
          roles={['STAFF']}
          entityLabel='nhân viên'
          canCreateStaff
          canManage
        />
      )
    }
  ],
  admin: [
    { path: 'appointments', element: <AppointmentsPage role='admin' /> },
    { path: 'customer-services', element: <CustomerServicePage role='admin' /> },
    {
      path: 'users/:userID',
      element: <UserDetailPage role='admin' backTo='/portal/admin/users' backLabel='Người dùng' />
    },
    { path: 'branches', element: <BranchesPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'blogs', element: <BlogsPage role='admin' /> },
    { path: 'blog-categories', element: <BlogCategoriesPage role='admin' /> },
    { path: 'services', element: <ServiceCatalogPage role='admin' /> },
    { path: 'service-categories', element: <ServiceCategoriesPage role='admin' /> },
    { path: 'products', element: <ProductManagementPage role='admin' /> },
    { path: 'products/:productID', element: <ProductDetailPage role='admin' /> },
    { path: 'product-categories', element: <ProductCategoriesPage role='admin' /> },
    {
      path: 'users',
      element: (
        <UserListPage
          role='admin'
          title='Người dùng'
          description='Toàn bộ tài khoản khách hàng, nhân viên và quản lý.'
          roles={['CUSTOMER', 'STAFF', 'MANAGER']}
          entityLabel='người dùng'
          canCreateStaff
          canPickBranch
          canManage
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
        { path: 'profile', element: <PortalProfilePage role={role} /> },
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
