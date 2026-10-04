export type AppointmentTone = 'in-care' | 'arrived' | 'confirmed' | 'call'

export interface DeskAppointment {
  readonly id: string
  readonly time: string
  readonly duration: string
  readonly name: string
  readonly initials: string
  readonly phone: string
  readonly tag?: string
  readonly tagTone?: 'vip' | 'plain'
  readonly kind: 'Lộ trình' | 'Dịch vụ'
  readonly detail: string
  readonly stage?: string
  readonly status: string
  readonly statusTone: 'progress' | 'wait' | 'muted' | 'alert'
  readonly action: string
  readonly actionTone: 'solid' | 'outline' | 'text'
  readonly tone: AppointmentTone
  readonly prescription?: DeskPrescription
}

export interface DeskProduct {
  readonly name: string
  readonly size: string
  readonly price: string
  readonly note: string
  readonly added: string
  readonly icon: string
}

export interface DeskPrescription {
  readonly plan: string
  readonly products: readonly DeskProduct[]
  readonly listPrice: string
  readonly memberPrice: string
}

export interface DeskProposal {
  readonly id: string
  readonly kind: string
  readonly sent: string
  readonly title: string
  readonly body: string
  readonly status: string
  readonly statusTone: 'wait' | 'done'
  readonly action: string
  readonly icon: string
}

export const deskGreeting = {
  name: 'Linh Đan',
  quote:
    'Chúc bạn một ngày phục vụ khách hàng tận tâm, chuẩn xác từng thao tác và tràn đầy năng lượng tích cực từ hoa cỏ tự nhiên.'
}

export const deskStats = [
  { label: 'Lịch hẹn hôm nay', value: '08', unit: 'ca', tone: 'text-ink' },
  { label: 'Khách hàng', value: '12', unit: 'lượt', tone: 'text-emerald-600' },
  { label: 'Đang thực hiện', value: '04', unit: 'phòng', tone: 'text-emerald-600' },
  { label: 'Chờ xử lý', value: '03', unit: 'yêu cầu', tone: 'text-orange-500' }
] as const

const goldPlan: DeskPrescription = {
  plan: 'Build Da Sinh Học & Phục Hồi Chuyên Sâu',
  listPrice: '2.266.000đ',
  memberPrice: '2.034.000đ',
  products: [
    {
      name: 'Aura Botanica Cellular Gold Elixir',
      size: '30ml',
      price: '896.000đ',
      note: 'Chỉ định: Thoa 3 giọt mỗi tối sau vi điểm, kích thích tái tạo & tăng biểu bì.',
      added: 'Đã thêm: 1 chai',
      icon: 'water_drop'
    },
    {
      name: 'Velvet Botanical Rose Renewal Cream',
      size: '50g',
      price: '750.000đ',
      note: 'Chỉ định: Khóa ẩm ceramide sinh học & dưỡng ẩm bảo vệ 2 lớp màng.',
      added: 'Đã thêm: 1 hũ',
      icon: 'spa'
    },
    {
      name: 'Radiance UV Shield SPF 50+ PA++++',
      size: '40ml',
      price: '620.000đ',
      note: 'Chỉ định: Bắt buộc dùng ban ngày cho chân quang phổ rộng chống thâm sạm.',
      added: 'Đã thêm: 1 tuýp',
      icon: 'wb_sunny'
    }
  ]
}

export const deskAppointmentTotal = 8

export const deskAppointments: readonly DeskAppointment[] = [
  {
    id: 'anh',
    time: '09:00',
    duration: '75 phút',
    name: 'Nguyễn Minh Anh',
    initials: 'MA',
    phone: '0919 . xxx . 456',
    tag: 'VIP Hội viên',
    tagTone: 'vip',
    kind: 'Lộ trình',
    detail: 'Build Da Sinh Học & Phục Hồi Chuyên Sâu',
    stage: 'Giai đoạn 2 — Bước 03: Treatment VI điểm tế bào gốc & Vàng 24K',
    status: 'Đã Check-in — Đang tại Phòng VIP 01',
    statusTone: 'progress',
    action: 'Tiếp tục chăm sóc',
    actionTone: 'solid',
    tone: 'in-care',
    prescription: goldPlan
  },
  {
    id: 'mai',
    time: '10:30',
    duration: '60 phút',
    name: 'Trần Ngọc Mai',
    initials: 'TM',
    phone: '0933 . xxx . 789',
    tag: 'Standard',
    tagTone: 'plain',
    kind: 'Lộ trình',
    detail: 'Trị Mụn & Phục Hồi Nâng Rào Bảo Vệ Da',
    status: 'Đã đến — Chờ Check-in sảnh đón',
    statusTone: 'wait',
    action: 'Check-in ngay',
    actionTone: 'outline',
    tone: 'arrived'
  },
  {
    id: 'my',
    time: '14:00',
    duration: '90 phút',
    name: 'Lê Hoàng Thảo My',
    initials: 'LM',
    phone: '0982 . xxx . 112',
    kind: 'Dịch vụ',
    detail: 'Thải Độc & Cấp Ẩm Chuyên Sâu Bio-Cellulose',
    status: 'Đã xác nhận hẹn (SDT)',
    statusTone: 'muted',
    action: 'Xem hồ sơ',
    actionTone: 'text',
    tone: 'confirmed'
  },
  {
    id: 'huong',
    time: '16:30',
    duration: '45 phút',
    name: 'Vũ Thanh Hương',
    initials: 'VH',
    phone: '0977 . xxx . 898',
    kind: 'Dịch vụ',
    detail: 'Soi da 3D & Đánh giá màng lipid tầng sâu',
    status: 'Chờ gọi nhắc nhận (15:00)',
    statusTone: 'alert',
    action: 'Gọi khách',
    actionTone: 'outline',
    tone: 'call'
  }
]

export const appointmentFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'in-care', label: 'Đang chăm sóc' },
  { id: 'arrived', label: 'Chờ check-in' },
  { id: 'confirmed', label: 'Đã xác nhận' },
  { id: 'call', label: 'Cần gọi' }
] as const

export type AppointmentFilter = (typeof appointmentFilters)[number]['id']

export const deskProposals: readonly DeskProposal[] = [
  {
    id: 'article',
    kind: 'Bài viết kiến thức',
    sent: 'Gửi hôm qua 17:30',
    title: 'Bí quyết phục hồi hàng rào ẩm cho da sau vi điểm tế bào gốc',
    body: 'Bài viết hướng dẫn khách cách phục hồi đặc biệt da khô thiếu nước và da tổn thương lipid, kèm checklist 5 bước dưỡng ẩm dịu.',
    status: 'Chờ Quản lý chuyên môn duyệt',
    statusTone: 'wait',
    action: 'Chỉnh sửa bản thảo',
    icon: 'article'
  },
  {
    id: 'plan',
    kind: 'Lộ trình phác đồ mới',
    sent: 'Gửi 28/09/2026',
    title: 'Phác đồ Trẻ hóa & Làm đầy rãnh nhăn Nano Gold 6 tuần',
    body: 'Đề xuất bổ sung bước điện di lạnh phân tử HA kép sau liệu trình Nano Gold để giảm 90% thời gian ửng đỏ cho khách hàng nhạy.',
    status: 'Manager đã phản hồi: Sẽ thử nghiệm tại CN Q1',
    statusTone: 'done',
    action: 'Xem phản hồi',
    icon: 'calendar_month'
  }
]
