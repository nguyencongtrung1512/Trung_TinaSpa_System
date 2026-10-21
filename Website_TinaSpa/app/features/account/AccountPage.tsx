import { useCallback, useState, useSyncExternalStore } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'
import { clearSession, useSession } from '~/lib/auth'
import { destinationForSession } from '~/portal/access'
import { outlineButtonClass } from '~/portal/manager/services/form-ui'
import { ChangePasswordDialog } from './ChangePasswordDialog'
import { ProfileForm } from './ProfileForm'
import { UsedServices } from './UsedServices'

const subscribeNoop = () => () => {}

export function AccountPage() {
  const { t } = useTranslation()
  const session = useSession()
  const navigate = useNavigate()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const openPassword = useCallback(() => setPasswordOpen(true), [])
  const closePassword = useCallback(() => setPasswordOpen(false), [])
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )

  if (!mounted) return <section className='min-h-[60vh] bg-[#FFF8FA]' />
  if (!session) return <Navigate to='/login' replace />

  const portal = destinationForSession(session)
  const isCustomer = session.user.role === 'CUSTOMER'
  const mustChangePassword = session.user.mustChangePassword === true

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <section className='bg-[#FFF8FA]'>
      <div className='mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-16'>
        <header className='flex flex-col gap-6 border-b border-rose-soft/60 pb-8 sm:flex-row sm:items-end sm:justify-between'>
          <div className='max-w-2xl'>
            <p className='inline-flex items-center gap-2 rounded-full border border-clinic/15 bg-mist px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-clinic uppercase'>
              <span className='size-1.5 rounded-full bg-clinic' />
              <StableText i18nKey='account.eyebrow' align='start' />
            </p>
            <h1 className='mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl lg:text-6xl'>
              <StableText i18nKey='account.title' block />
            </h1>
            <p className='mt-3 text-sm leading-7 text-ink/70 sm:text-base'>
              <StableText i18nKey='account.intro' block />
            </p>
          </div>
          <div className='flex shrink-0 flex-wrap gap-2'>
            {portal !== '/' ? (
              <Link to={portal} className={outlineButtonClass}>
                <Icon name='work' size={18} />
                {t('account.portalLink')}
              </Link>
            ) : null}
            <button type='button' className={outlineButtonClass} onClick={logout}>
              <Icon name='logout' size={18} />
              {t('account.logout')}
            </button>
          </div>
        </header>

        {mustChangePassword ? (
          <div className='mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between'>
            <p className='flex items-start gap-2'>
              <Icon name='warning' size={18} className='mt-0.5 shrink-0' />
              {t('account.password.notice')}
            </p>
            <button
              type='button'
              className='shrink-0 self-start rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700 sm:self-auto'
              onClick={openPassword}
            >
              {t('account.password.open')}
            </button>
          </div>
        ) : null}

        <div
          className={`mt-8 grid items-start gap-6 lg:gap-8 ${
            isCustomer ? 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'mx-auto max-w-2xl'
          }`}
        >
          <div className='relative overflow-hidden rounded-[28px] border border-rose-soft/60 bg-white p-5 shadow-[0_20px_50px_rgba(58,41,48,0.06)] sm:p-8 lg:sticky lg:top-28'>
            <span
              aria-hidden
              className='pointer-events-none absolute -right-16 -bottom-16 size-56 rotate-45 rounded-[48px] bg-mist/60'
            />
            <div className='relative'>
              <ProfileForm initialUser={session.user} onChangePassword={openPassword} />
            </div>
          </div>
          {isCustomer ? <UsedServices /> : null}
        </div>
      </div>

      <ChangePasswordDialog open={passwordOpen} highlight={mustChangePassword} onClose={closePassword} />
    </section>
  )
}
