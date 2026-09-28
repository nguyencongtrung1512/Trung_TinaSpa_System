import { HomePage } from '~/components/home/HomePage'
import { SiteShell } from '~/components/layout/SiteShell'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Dr Tina Beauty — Chăm sóc sắc đẹp chuyên nghiệp' },
    {
      name: 'description',
      content:
        'Phòng khám thẩm mỹ Dr Tina Beauty. BS. Nguyễn Lânn tư vấn liệu trình da, trẻ hóa và chăm sóc spa y khoa.'
    }
  ]
}

export default function Home() {
  return (
    <SiteShell>
      <HomePage />
    </SiteShell>
  )
}
