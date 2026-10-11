import type { PortalAction, PortalActor, PortalNavGroup, PortalRole } from '~/portal/types'

export const portalRoleLabel: Record<PortalRole, string> = {
  staff: 'STAFF PORTAL',
  manager: 'MANAGER PORTAL',
  admin: 'ADMIN PORTAL'
}

export const portalActors: Record<PortalRole, PortalActor> = {
  staff: { name: 'Nhân viên', title: 'Nhân viên chăm sóc khách hàng', initials: 'NV', branch: 'Tất cả khu vực' },
  manager: { name: 'Quản lý', title: 'Quản lý chi nhánh', initials: 'QL', branch: 'Tất cả khu vực' },
  admin: { name: 'Quản trị viên', title: 'Quản trị hệ thống', initials: 'AD', branch: 'Toàn hệ thống' }
}

export const portalActions: Record<PortalRole, readonly PortalAction[]> = {
  staff: [
    { label: 'Ghi dịch vụ', icon: 'receipt_long', to: '/portal/staff/customer-services', tone: 'solid' }
  ],
  manager: [
    { label: 'Nhân viên', icon: 'badge', to: '/portal/manager/staff', tone: 'outline' },
    { label: 'Khách hàng', icon: 'group', to: '/portal/manager/customers', tone: 'outline' },
    { label: 'Ghi dịch vụ', icon: 'receipt_long', to: '/portal/manager/customer-services', tone: 'solid' }
  ],
  admin: [
    { label: 'Người dùng', icon: 'manage_accounts', to: '/portal/admin/users', tone: 'outline' },
    { label: 'Dịch vụ', icon: 'spa', to: '/portal/admin/services', tone: 'outline' },
    { label: 'Ghi dịch vụ', icon: 'receipt_long', to: '/portal/admin/customer-services', tone: 'solid' }
  ]
}

const staffNavigation: readonly PortalNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        label: 'Bàn làm việc',
        icon: 'dashboard',
        to: '/portal/staff',
        summary: 'Lịch phục vụ, tư vấn sản phẩm và đề xuất trong ngày.'
      }
    ]
  },
  {
    label: 'Khách hàng & lịch',
    items: [
      {
        label: 'Lịch hẹn',
        icon: 'calendar_month',
        to: '/portal/staff/appointments',
        summary: 'Lịch khách đặt qua website theo khu vực: xác nhận và chỉnh thời gian.'
      },
      {
        label: 'Dịch vụ của khách',
        icon: 'receipt_long',
        to: '/portal/staff/customer-services',
        summary: 'Tìm khách theo số điện thoại, tạo tài khoản và ghi dịch vụ đã sử dụng.'
      }
    ]
  },
  {
    label: 'Nội dung & danh mục',
    items: [
      {
        label: 'Ghi nhận kết quả',
        icon: 'photo_camera',
        to: '/portal/staff/results',
        summary: 'Ảnh và ghi chú sau buổi chăm sóc.',
        badge: 'dot'
      },
      {
        label: 'Bài viết của tôi',
        icon: 'article',
        to: '/portal/staff/articles',
        summary: 'Bản thảo kiến thức gửi quản lý duyệt.'
      },
      {
        label: 'Danh mục dịch vụ',
        icon: 'spa',
        to: '/portal/staff/services',
        summary: 'Dịch vụ đang mở tại chi nhánh.'
      },
      {
        label: 'Sản phẩm tư vấn',
        icon: 'inventory_2',
        to: '/portal/staff/products',
        summary: 'Sản phẩm dùng khi kê đơn chăm sóc tại nhà.'
      }
    ]
  }
]

const managerNavigation: readonly PortalNavGroup[] = [
  {
    label: 'Điều hành chi nhánh',
    items: [
      {
        label: 'Tổng quan',
        icon: 'dashboard',
        to: '/portal/manager',
        summary: 'Doanh thu, lịch trình phòng trị liệu và việc cần duyệt trong ngày.'
      },
      {
        label: 'Lịch hẹn',
        icon: 'calendar_month',
        to: '/portal/manager/appointments',
        summary: 'Lịch khách đặt qua website theo ngày và khu vực.'
      },
      {
        label: 'Dịch vụ của khách',
        icon: 'receipt_long',
        to: '/portal/manager/customer-services',
        summary: 'Tìm khách theo số điện thoại, tạo tài khoản và ghi dịch vụ đã sử dụng.'
      },
      {
        label: 'Khách hàng',
        icon: 'group',
        to: '/portal/manager/customers',
        summary: 'Tài khoản khách hàng đã đăng ký trên website.'
      },
      {
        label: 'Nhân viên',
        icon: 'badge',
        to: '/portal/manager/staff',
        summary: 'Tài khoản chuyên viên và nhân viên của chi nhánh.'
      }
    ]
  },
  {
    label: 'Dịch vụ & phác đồ',
    items: [
      {
        label: 'Dịch vụ & Menu trị liệu',
        icon: 'spa',
        to: '/portal/manager/services',
        summary: 'Nhóm dịch vụ, giá và thời lượng hiển thị trên website và form đặt lịch.'
      },
      {
        label: 'Sản phẩm',
        icon: 'inventory_2',
        to: '/portal/manager/products',
        summary: 'Sản phẩm bán lẻ và tồn kho chi nhánh.'
      },
      {
        label: 'Lộ trình chăm sóc',
        icon: 'healing',
        to: '/portal/manager/treatments',
        summary: 'Phác đồ đang áp dụng và khách theo từng lộ trình.'
      }
    ]
  },
  {
    label: 'Nội dung & website',
    items: [
      {
        label: 'Duyệt bài viết',
        icon: 'rate_review',
        to: '/portal/manager/article-review',
        summary: 'Bài viết kiến thức nhân viên gửi lên chờ duyệt.',
        badge: '3 chờ'
      }
    ]
  },
  {
    label: 'Kinh doanh & quản trị',
    items: [
      {
        label: 'Doanh thu chi nhánh',
        icon: 'payments',
        to: '/portal/manager/revenue',
        summary: 'Doanh thu theo ngày, dịch vụ và chuyên viên.'
      }
    ]
  }
]

const adminNavigation: readonly PortalNavGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        label: 'Bàn làm việc',
        icon: 'dashboard',
        to: '/portal/admin',
        summary: 'Điểm vào cổng quản trị.'
      },
      {
        label: 'Lịch hẹn',
        icon: 'calendar_month',
        to: '/portal/admin/appointments',
        summary: 'Lịch khách đặt qua website theo ngày và khu vực.'
      },
      {
        label: 'Dịch vụ của khách',
        icon: 'receipt_long',
        to: '/portal/admin/customer-services',
        summary: 'Tìm khách theo số điện thoại, tạo tài khoản và ghi dịch vụ đã sử dụng.'
      }
    ]
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Người dùng',
        icon: 'manage_accounts',
        to: '/portal/admin/users',
        summary: 'Tài khoản nhân viên, quản lý và quản trị.'
      },
      {
        label: 'Chi nhánh',
        icon: 'store',
        to: '/portal/admin/branches',
        summary: 'Danh sách chi nhánh đang hoạt động.'
      },
      {
        label: 'Cấu hình',
        icon: 'settings',
        to: '/portal/admin/settings',
        summary: 'Thiết lập dùng chung cho toàn bộ cổng, chương trình khuyến mãi.'
      }
    ]
  },
  {
    label: 'Danh mục',
    items: [
      {
        label: 'Dịch vụ & Menu trị liệu',
        icon: 'spa',
        to: '/portal/admin/services',
        summary: 'Nhóm dịch vụ, giá và thời lượng hiển thị trên website và form đặt lịch.'
      }
    ]
  }
]

export const portalNavigation: Record<PortalRole, readonly PortalNavGroup[]> = {
  staff: staffNavigation,
  manager: managerNavigation,
  admin: adminNavigation
}

export function findNavItem(role: PortalRole, pathname: string) {
  for (const group of portalNavigation[role]) {
    const item = group.items.find((entry) => entry.to === pathname)
    if (item) return item
  }
  return undefined
}
