export interface NavLinkItem {
  readonly label: string
  readonly href: string
}

export interface StatItem {
  readonly value: string
  readonly label: string
}

export interface ServiceItem {
  readonly icon: string
  readonly title: string
  readonly description: string
}

export interface ReasonItem {
  readonly icon: string
  readonly title: string
  readonly description: string
}

export interface ProcessStep {
  readonly step: string
  readonly icon: string
  readonly title: string
  readonly description: string
}

export interface TeamMember {
  readonly name: string
  readonly role: string
  readonly image: string
  readonly imageAlt: string
}

export interface TestimonialItem {
  readonly quote: string
  readonly name: string
  readonly detail: string
}

export interface ResultCase {
  readonly id: string
  readonly label: string
  readonly title: string
  readonly result: string
  readonly note: string
  readonly sessions: string
  readonly duration: string
  readonly beforeSrc: string
  readonly afterSrc: string
  readonly beforeAlt: string
  readonly afterAlt: string
}

export const brand = {
  name: 'Dr Tina Beauty',
  shortName: 'Tina Beauty',
  logo: '/images/logo.png',
  phone: '0123 456 789',
  email: 'hello@drtinabeauty.vn',
  address: 'TP. Hồ Chí Minh',
  hours: '8:00 — 20:00'
} as const

export const navLinks: readonly NavLinkItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/about' },
  { label: 'Dịch vụ', href: '/#Service' },
  { label: 'Sản phẩm', href: '/products' },
  { label: 'Liên hệ', href: '/#Contact' }
]

export const hero = {
  eyebrow: 'Chào mừng đến với Dr Tina Beauty',
  title: 'Chăm sóc sắc đẹp chuyên nghiệp, tận tâm',
  description:
    'Phòng khám kết hợp thẩm mỹ y khoa và không gian spa yên tĩnh. BS. Nguyễn Lânn đồng hành cùng bạn từ tư vấn da đến liệu trình cá nhân hóa.',
  primaryCta: { label: 'Đặt lịch ngay', href: '/booking' },
  secondaryCta: { label: 'Tìm hiểu thêm', href: '/about' },
  portrait: {
    src: '/images/image 1.png',
    alt: 'BS. Nguyễn Lânn — bác sĩ thẩm mỹ Dr Tina Beauty'
  }
} as const

export const stats: readonly StatItem[] = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '1000+', label: 'Khách hàng tin tưởng' },
  { value: '100+', label: 'Liệu trình chuyên sâu' },
  { value: '5+', label: 'Nhóm dịch vụ thẩm mỹ' }
]

export const services: readonly ServiceItem[] = [
  {
    icon: 'dermatology',
    title: 'Khám da tổng quát',
    description: 'Đánh giá tình trạng da, xác định nguyên nhân và phác đồ phù hợp trước khi điều trị.'
  },
  {
    icon: 'face_retouching_natural',
    title: 'Điều trị mụn',
    description: 'Liệu trình y khoa giảm viêm, kiểm soát dầu và phục hồi hàng rào bảo vệ da.'
  },
  {
    icon: 'spa',
    title: 'Trẻ hóa da',
    description: 'Công nghệ trẻ hóa giúp da căng mịn, đều màu và khỏe hơn theo thời gian.'
  },
  {
    icon: 'wb_iridescent',
    title: 'Laser thẩm mỹ',
    description: 'Hỗ trợ nám, sẹo, lỗ chân lông và các vấn đề sắc tố dưới sự theo dõi của bác sĩ.'
  },
  {
    icon: 'self_improvement',
    title: 'Chăm sóc body',
    description: 'Liệu trình thư giãn kết hợp chăm sóc chuyên sâu cho cơ thể sau ngày dài.'
  },
  {
    icon: 'favorite',
    title: 'Tư vấn liệu trình',
    description: 'Lộ trình cá nhân hóa theo mục tiêu sắc đẹp, ngân sách và lịch sinh hoạt.'
  }
]

export const reasons: readonly ReasonItem[] = [
  {
    icon: 'verified_user',
    title: 'Bác sĩ trực tiếp tư vấn',
    description: 'Mỗi liệu trình được BS. Nguyễn Lânn xem xét, giải thích rõ ràng trước khi thực hiện.'
  },
  {
    icon: 'biotech',
    title: 'Công nghệ hiện đại',
    description: 'Thiết bị thẩm mỹ được chọn lọc, ưu tiên an toàn và hiệu quả có thể theo dõi.'
  },
  {
    icon: 'yard',
    title: 'Không gian thư giãn',
    description: 'Phòng trị liệu sáng, yên, cảm giác spa hơn là hành lang bệnh viện.'
  },
  {
    icon: 'volunteer_activism',
    title: 'Liệu trình riêng cho bạn',
    description: 'Không áp dụng gói cứng. Mục tiêu da và nhịp hồi phục quyết định phác đồ.'
  }
]

export const processSteps: readonly ProcessStep[] = [
  {
    step: '01',
    icon: 'calendar_month',
    title: 'Đặt lịch hẹn',
    description: 'Chọn khung giờ phù hợp. Phòng khám xác nhận và nhắc lịch trước buổi tư vấn.'
  },
  {
    step: '02',
    icon: 'stethoscope',
    title: 'Tư vấn bác sĩ',
    description: 'Khám da, nghe mong muốn và nhận đề xuất liệu trình kèm lưu ý chăm sóc.'
  },
  {
    step: '03',
    icon: 'healing',
    title: 'Thực hiện liệu trình',
    description: 'Kỹ thuật viên và bác sĩ phối hợp trong không gian riêng, đúng phác đồ đã thống nhất.'
  },
  {
    step: '04',
    icon: 'monitoring',
    title: 'Chăm sóc sau điều trị',
    description: 'Theo dõi phản ứng da, hướng dẫn dưỡng tại nhà và hẹn tái khám khi cần.'
  }
]

export const team: readonly TeamMember[] = [
  {
    name: 'BS. Nguyễn Lânn',
    role: 'Bác sĩ thẩm mỹ',
    image: '/images/image 1.png',
    imageAlt: 'Chân dung BS. Nguyễn Lânn'
  },
  {
    name: 'Chuyên gia chăm sóc da',
    role: 'Liệu trình chuyên sâu',
    image: '/images/screen1.png',
    imageAlt: 'Không gian liệu trình chăm sóc da'
  },
  {
    name: 'Kỹ thuật viên spa',
    role: 'Trải nghiệm thư giãn',
    image: '/images/screen.png',
    imageAlt: 'Không gian spa Dr Tina Beauty'
  }
]

export const testimonials: readonly TestimonialItem[] = [
  {
    quote:
      'Buổi tư vấn rõ ràng, không bị thúc ép làm dịch vụ. Da tôi dịu hơn sau liệu trình điều trị mụn.',
    name: 'Minh Anh',
    detail: 'Khách liệu trình da'
  },
  {
    quote: 'Không gian yên và sạch. Tôi yên tâm vì bác sĩ giải thích từng bước trước khi bắt đầu.',
    name: 'Thu Hà',
    detail: 'Khách trẻ hóa da'
  },
  {
    quote: 'Lịch hẹn đúng giờ, chăm sóc sau điều trị chu đáo. Sẽ quay lại cho liệu trình tiếp theo.',
    name: 'Lan Phương',
    detail: 'Khách chăm sóc định kỳ'
  }
]

export const resultCases: readonly ResultCase[] = [
  {
    id: '01',
    label: 'Ca điều trị 01',
    title: 'Phục hồi da chuyên sâu',
    result: 'Tổn thương & kích ứng giảm mạnh 96%',
    note: 'Da kích ứng, mất nước được phục hồi trọn vẹn',
    sessions: '06 buổi',
    duration: '8 tuần',
    beforeSrc: '/images/screen.png',
    afterSrc: '/images/screen1.png',
    beforeAlt: 'Ảnh trước liệu trình phục hồi da',
    afterAlt: 'Ảnh sau liệu trình phục hồi da'
  },
  {
    id: '02',
    label: 'Ca điều trị 02',
    title: 'Liệu trình mờ thâm nám',
    result: 'Nám mảng & tàn nhang giảm 88%',
    note: 'Melanin tích tụ dày, viền màu trở nên rạng rỡ hơn',
    sessions: '08 buổi',
    duration: '10 tuần',
    beforeSrc: '/images/screen1.png',
    afterSrc: '/images/screen.png',
    beforeAlt: 'Ảnh trước liệu trình mờ thâm nám',
    afterAlt: 'Ảnh sau liệu trình mờ thâm nám'
  },
  {
    id: '03',
    label: 'Ca điều trị 03',
    title: 'Trị mụn & kháng viêm',
    result: 'Mụn viêm được kiểm soát hoàn toàn',
    note: 'Tăng tiết bã nhờn, da khít và mờ thâm',
    sessions: '05 buổi',
    duration: '6 tuần',
    beforeSrc: '/images/image 1.png',
    afterSrc: '/images/screen1.png',
    beforeAlt: 'Ảnh trước liệu trình trị mụn',
    afterAlt: 'Ảnh sau liệu trình trị mụn'
  }
]

export const footerColumns = {
  explore: [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Dịch vụ', href: '/#dich-vu' },
    { label: 'Sản phẩm', href: '/products' },
    { label: 'Đặt lịch', href: '/booking' }
  ],
  care: [
    { label: 'Khám da tổng quát', href: '/#dich-vu' },
    { label: 'Điều trị mụn', href: '/#dich-vu' },
    { label: 'Trẻ hóa da', href: '/#dich-vu' },
    { label: 'Laser thẩm mỹ', href: '/#dich-vu' }
  ]
} as const
