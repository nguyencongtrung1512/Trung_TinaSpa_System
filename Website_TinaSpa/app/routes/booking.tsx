import { BookingPage } from '~/features/booking/BookingPage'
import { SiteShell } from '~/components/layout/SiteShell'
import i18n from '~/i18n'

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
    { title: i18n.t('meta.booking.title') },
    { name: 'description', content: i18n.t('meta.booking.description') }
  ]
}

export default function Booking() {
  return (
    <SiteShell>
      <BookingPage />
    </SiteShell>
  )
}
