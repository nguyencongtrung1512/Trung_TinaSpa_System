import { BookingPage } from '~/features/booking/BookingPage'
import { SiteShell } from '~/components/layout/SiteShell'

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Dancing+Script:wght@500;600;700&display=swap'
    }
  ]
}

export function meta() {
  return [
    { title: 'Đặt lịch hẹn — Dr Tina Beauty' },
    {
      name: 'description',
      content: 'Dành một chút thời gian cho bản thân. Đặt lịch chăm sóc sắc đẹp cùng Dr Tina Beauty.'
    }
  ]
}

export default function Booking() {
  return (
    <SiteShell>
      <BookingPage />
    </SiteShell>
  )
}
