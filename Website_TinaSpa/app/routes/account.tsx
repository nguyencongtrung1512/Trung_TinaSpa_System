import { AccountPage } from '~/features/account/AccountPage'
import { SiteShell } from '~/components/layout/SiteShell'
import i18n from '~/i18n'

export function meta() {
  return [{ title: i18n.t('meta.account.title') }, { name: 'description', content: i18n.t('meta.account.description') }]
}

export default function Account() {
  return (
    <SiteShell>
      <AccountPage />
    </SiteShell>
  )
}
