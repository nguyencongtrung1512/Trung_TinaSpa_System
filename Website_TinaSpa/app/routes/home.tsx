import { HomePage } from '~/components/home/HomePage'
import { SiteShell } from '~/components/layout/SiteShell'
import i18n from '~/i18n'
import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [{ title: i18n.t('meta.home.title') }, { name: 'description', content: i18n.t('meta.home.description') }]
}

export default function Home() {
  return (
    <SiteShell>
      <HomePage />
    </SiteShell>
  )
}
