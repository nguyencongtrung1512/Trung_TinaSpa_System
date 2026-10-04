import { SiteShell } from '~/components/layout/SiteShell'
import { ContactPage } from '~/features/contact/ContactPage'
import i18n from '~/i18n'

export function meta() {
  return [
    { title: i18n.t('meta.contact.title') },
    { name: 'description', content: i18n.t('meta.contact.description') }
  ]
}

export default function Contact() {
  return (
    <SiteShell>
      <ContactPage />
    </SiteShell>
  )
}
