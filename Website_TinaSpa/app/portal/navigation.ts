import type { PortalAction, PortalActor, PortalNavGroup, PortalRole } from '~/portal/types'

export const portalRoleLabel: Record<PortalRole, string> = {
  staff: 'STAFF PORTAL',
  manager: 'MANAGER PORTAL',
  admin: 'ADMIN PORTAL'
}

export const portalActors: Record<PortalRole, PortalActor> = {
  staff: {
    name: 'Linh Đan',
    title: 'NV chăm sóc KH',
    initials: 'LD',
    branch: 'Chi nhánh Quận 1 — TP. Hồ Chí Minh'
  },
  manager: {
    name: 'Trần Bảo Ngọc',
    title: 'Quản lý chi nhánh',
    initials: 'BN',
    branch: 'Chi nhánh Quận 1 (Bến Nghé)'
  },
  admin: {
    name: 'Admin',
    title: 'Quản trị hệ thống',
    initials: 'AD',
    branch: 'Toàn hệ thống'
  }
}

export const portalActions: Record<PortalRole, readonly PortalAction[]> = {
  staff: [
    { label: 'Check-in nhanh', icon: 'bolt', tone: 'solid' }
  ],
  manager: [
    { label: 'Duyệt bài viết', icon: 'rate_review', to: '/portal/manager/duyet-bai-viet', tone: 'outline' },
    { label: 'Nhân viên', icon: 'badge', to: '/portal/manager/nhan-vien', tone: 'outline' },
    { label: 'Báo cáo doanh thu', icon: 'monitoring', to: '/portal/manager/doanh-thu', tone: 'solid' }
  ],
  admin: [
    { label: 'Người dùng', icon: 'manage_accounts', to: '/portal/admin/nguoi-dung', tone: 'outline' },
    { label: 'Chi nhánh', icon: 'store', to: '/portal/admin/chi-nhanh', tone: 'outline' },
    { label: 'Cấu hình', icon: 'settings', to: '/portal/admin/cau-hinh', tone: 'solid' }
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
        to: '/portal/staff/lich-hen',
        summary: 'Lịch khách đặt qua website theo khu vực: xác nhận và chỉnh thời gian.'
      }
    ]
  },
  {
    label: 'Nội dung & danh mục',
    items: [
      {
        label: 'Ghi nhận kết quả',
        icon: 'photo_camera',
        to: '/portal/staff/ket-qua',
        summary: 'Ảnh và ghi chú sau buổi chăm sóc.',
        badge: 'dot'
      },
      {
        label: 'Bài viết của tôi',
        icon: 'article',
        to: '/portal/staff/bai-viet',
        summary: 'Bản thảo kiến thức gửi quản lý duyệt.'
      },
      {
        label: 'Danh mục dịch vụ',
        icon: 'spa',
        to: '/portal/staff/dich-vu',
        summary: 'Dịch vụ đang mở tại chi nhánh.'
      },
      {
        label: 'Sản phẩm tư vấn',
        icon: 'inventory_2',
        to: '/portal/staff/san-pham',
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
        to: '/portal/manager/lich-hen',
        summary: 'Lịch khách đặt qua website theo ngày và khu vực.'
      },
      {
        label: 'Khách hàng',
        icon: 'group',
        to: '/portal/manager/khach-hang',
        summary: 'Tài khoản khách hàng đã đăng ký trên website.'
      },
      {
        label: 'Nhân viên',
        icon: 'badge',
        to: '/portal/manager/nhan-vien',
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
        to: '/portal/manager/dich-vu',
        summary: 'Nhóm dịch vụ, giá và thời lượng hiển thị trên website và form đặt lịch.'
      },
      {
        label: 'Sản phẩm',
        icon: 'inventory_2',
        to: '/portal/manager/san-pham',
        summary: 'Sản phẩm bán lẻ và tồn kho chi nhánh.'
      },
      {
        label: 'Lộ trình chăm sóc',
        icon: 'healing',
        to: '/portal/manager/lo-trinh',
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
        to: '/portal/manager/duyet-bai-viet',
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
        to: '/portal/manager/doanh-thu',
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
        to: '/portal/admin/lich-hen',
        summary: 'Lịch khách đặt qua website theo ngày và khu vực.'
      }
    ]
  },
  {
    label: 'Hệ thống',
    items: [
      {
        label: 'Người dùng',
        icon: 'manage_accounts',
        to: '/portal/admin/nguoi-dung',
        summary: 'Tài khoản nhân viên, quản lý và quản trị.'
      },
      {
        label: 'Chi nhánh',
        icon: 'store',
        to: '/portal/admin/chi-nhanh',
        summary: 'Danh sách chi nhánh đang hoạt động.'
      },
      {
        label: 'Cấu hình',
        icon: 'settings',
        to: '/portal/admin/cau-hinh',
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
        to: '/portal/admin/dich-vu',
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
