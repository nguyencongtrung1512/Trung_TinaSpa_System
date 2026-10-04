import { SiteShell } from '~/components/layout/SiteShell'
import { ServicesPage } from '~/features/services/ServicesPage'
import i18n from '~/i18n'

export function meta() {
  return [
    { title: i18n.t('meta.services.title') },
    { name: 'description', content: i18n.t('meta.services.description') }
  ]
}

export default function Services() {
  return (
    <SiteShell>
      <ServicesPage />
    </SiteShell>
  )
}
