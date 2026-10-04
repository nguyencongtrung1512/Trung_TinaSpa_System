export const overviewRanges = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: '7 ngày' },
  { id: 'month', label: 'Tháng này' }
] as const

export type OverviewRange = (typeof overviewRanges)[number]['id']

export interface OverviewMetric {
  readonly label: string
  readonly value: string
  readonly unit: string
  readonly icon: string
}

export interface OverviewSnapshot {
  readonly revenueLabel: string
  readonly revenue: string
  readonly change: string
  readonly trendLabel: string
  readonly trend: readonly number[]
  readonly metrics: readonly OverviewMetric[]
}

export const overviewSnapshots: Record<OverviewRange, OverviewSnapshot> = {
  today: {
    revenueLabel: 'Doanh thu chi nhánh hôm nay',
    revenue: '6.840.000',
    change: '+4,1% so với hôm qua',
    trendLabel: 'Theo giờ',
    trend: [2, 3, 3, 5, 4, 6, 7, 6, 8, 9, 8, 10],
    metrics: [
      { label: 'Lịch hẹn hôm nay', value: '14', unit: 'lịch', icon: 'calendar_month' },
      { label: 'Khách đã check-in', value: '9', unit: 'khách', icon: 'how_to_reg' },
      { label: 'Phòng đang dùng', value: '4', unit: 'phòng', icon: 'meeting_room' }
    ]
  },
  week: {
    revenueLabel: 'Doanh thu chi nhánh 7 ngày',
    revenue: '38.200.000',
    change: '+7,6% so với tuần trước',
    trendLabel: 'Xu hướng 7 ngày',
    trend: [5, 6, 5, 7, 8, 7, 9],
    metrics: [
      { label: 'Lịch hẹn tuần', value: '41', unit: 'lịch', icon: 'calendar_month' },
      { label: 'Khách hàng mới', value: '18', unit: 'hồ sơ', icon: 'person_add' },
      { label: 'Theo lộ trình', value: '31', unit: 'khách', icon: 'healing' }
    ]
  },
  month: {
    revenueLabel: 'Doanh thu chi nhánh tháng này',
    revenue: '128.500.000',
    change: '+12,8% so với tháng trước',
    trendLabel: 'Xu hướng 30 ngày',
    trend: [3, 4, 3, 5, 4, 5, 6, 5, 6, 7, 6, 6, 7, 8, 7, 8, 7, 9, 8, 9, 10, 9, 10, 11, 10, 11, 12, 11, 12, 13],
    metrics: [
      { label: 'Lịch hẹn tháng', value: '86', unit: 'lịch', icon: 'calendar_month' },
      { label: 'Khách hàng quản lý', value: '342', unit: 'hồ sơ', icon: 'face' },
      { label: 'Theo lộ trình', value: '48', unit: 'khách', icon: 'healing' }
    ]
  }
}

export type SessionStage = 'in-progress' | 'room-ready' | 'arriving' | 'unassigned'

export interface TreatmentSession {
  readonly id: string
  readonly time: string
  readonly customer: string
  readonly plan: string
  readonly specialist: string | null
  readonly stage: SessionStage
  readonly primaryAction: string
  readonly secondaryAction?: string
}

export const todaySessionTotal = 14

export const treatmentSessions: readonly TreatmentSession[] = [
  {
    id: 'an',
    time: '09:00',
    customer: 'Nguyễn Thị An',
    plan: 'Lộ trình Trị Mụn Phục Hồi — Giai đoạn 2 (Buổi 6/12)',
    specialist: 'Linh Đan',
    stage: 'in-progress',
    primaryAction: 'Chi tiết phác đồ',
    secondaryAction: 'Ghi chú ca'
  },
  {
    id: 'mai',
    time: '10:30',
    customer: 'Trần Thục Mai',
    plan: 'Cấy Tế Bào Gốc Aura Gold 24K — Gói Trẻ Hóa Độc Bản',
    specialist: 'Thảo Vy',
    stage: 'room-ready',
    primaryAction: 'Vào phòng điều trị',
    secondaryAction: 'Đổi phòng'
  },
  {
    id: 'cuc',
    time: '14:00',
    customer: 'Lê Hoàng Cúc',
    plan: 'Phác đồ Build Da Sinh Học (Bio-Renewal Peeling)',
    specialist: 'Mai Anh',
    stage: 'arriving',
    primaryAction: 'Check-in nhanh',
    secondaryAction: 'Đổi lịch'
  },
  {
    id: 'huong',
    time: '16:00',
    customer: 'Vũ Thanh Hương',
    plan: 'Thải độc da & Soi da 3D chuyên sâu',
    specialist: null,
    stage: 'unassigned',
    primaryAction: 'Gán nhân viên ngay'
  }
]

export interface ApprovalTask {
  readonly id: string
  readonly kind: string
  readonly kindIcon: string
  readonly tone: 'article' | 'booking'
  readonly meta: string
  readonly title?: string
  readonly body: string
  readonly action: string
  readonly doneLabel: string
}

export const approvalTaskTotal = 4

export const approvalTasks: readonly ApprovalTask[] = [
  {
    id: 'article',
    kind: 'Bài viết chờ duyệt',
    kindIcon: 'article',
    tone: 'article',
    meta: '15 phút trước',
    title: '“Bí quyết phục hồi hàng rào ẩm cho da sau vi điểm y khoa”',
    body: 'Tác giả: KTV Linh Đan • Đăng tải tại chuyên mục Blog Kiến thức chăm sóc da',
    action: 'Xem & Duyệt ngay',
    doneLabel: 'Đã duyệt bài viết'
  },
  {
    id: 'website',
    kind: 'Đặt chỗ từ Website',
    kindIcon: 'language',
    tone: 'booking',
    meta: '5 yêu cầu mới',
    body: '5 khách hàng đã đặt lịch tư vấn và soi da trực tuyến cần chi nhánh gọi xác nhận khung giờ phục vụ chiều nay.',
    action: 'Phân bổ phòng & nhân viên',
    doneLabel: 'Đã phân bổ 5 yêu cầu'
  }
]
