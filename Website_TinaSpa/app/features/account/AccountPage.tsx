import { useSyncExternalStore } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'
import { clearSession, useSession } from '~/lib/auth'
import { destinationForSession } from '~/portal/access'
import { outlineButtonClass } from '~/portal/manager/services/form-ui'
import { ProfileForm } from './ProfileForm'

const subscribeNoop = () => () => {}

export function AccountPage() {
  const { t } = useTranslation()
  const session = useSession()
  const navigate = useNavigate()
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )

  if (!mounted) return <section className='min-h-[60vh] bg-[#FFF8FA]' />
  if (!session) return <Navigate to='/login' replace />

  const portal = destinationForSession(session)

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <section className='bg-[#FFF8FA]'>
      <div className='mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 lg:py-16'>
        <p className='flex items-center gap-3 text-[11px] font-medium tracking-[0.22em] text-[#D4145A] uppercase'>
          <span className='h-1.5 w-1.5 rounded-full bg-[#D4145A]' />
          <StableText i18nKey='account.eyebrow' align='start' />
        </p>
        <div className='mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h1 className='font-["Cormorant_Garamond",serif] text-4xl leading-none font-semibold text-[#3A2930] sm:text-5xl'>
              <StableText i18nKey='account.title' block />
            </h1>
            <p className='mt-3 text-sm leading-7 text-[#3A2930]/75'>
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
        </div>

        <div className='mt-8 rounded-[28px] border border-rose-soft/60 bg-white p-5 shadow-[0_20px_50px_rgba(58,41,48,0.06)] sm:p-8'>
          <ProfileForm initialUser={session.user} />
        </div>
      </div>
    </section>
  )
}
