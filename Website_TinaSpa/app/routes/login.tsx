import { LoginPage } from '~/components/start/login/LoginPage'
import i18n from '~/i18n'

export function meta() {
  return [{ title: i18n.t('meta.login.title') }, { name: 'description', content: i18n.t('meta.login.description') }]
}

export default function Login() {
  return <LoginPage />
}
