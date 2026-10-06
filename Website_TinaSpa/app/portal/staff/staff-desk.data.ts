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
  }

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
