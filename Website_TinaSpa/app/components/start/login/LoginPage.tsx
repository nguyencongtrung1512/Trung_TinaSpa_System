import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { LanguageSwitcher } from '~/components/ui/LanguageSwitcher'
import { StableText } from '~/components/ui/StableText'
import { fadeIn, fadeUp, pressable, stagger } from '~/components/ui/motion'
import { destinationForSession } from '~/portal/access'
import { loadSession, login, register, saveSession } from '~/lib/auth'

const legalLinks = [
  { key: 'terms', href: '/#lien-he' },
  { key: 'privacy', href: '/#lien-he' },
  { key: 'process', href: '/services' }
] as const

type AuthTab = 'login' | 'register'

type FormError = { readonly key: string } | { readonly text: string }

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [tab, setTab] = useState<AuthTab>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<FormError | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const session = loadSession()
    if (!session) return
    const destination = destinationForSession(session)
    if (destination !== '/') navigate(destination, { replace: true })
  }, [navigate])

  const isLogin = tab === 'login'
  const submitLabel = pending ? t('login.processing') : isLogin ? t('login.login') : t('login.register')
  const errorMessage = error ? ('key' in error ? t(error.key) : error.text) : null

  function selectTab(next: AuthTab) {
    setTab(next)
    setError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const normalizedPhone = phone.replace(/[\s.-]/g, '')
    if (!/^\+?[0-9]{9,15}$/.test(normalizedPhone)) {
      setError({ key: 'login.errors.phone' })
      return
    }

    if (!isLogin && fullName.trim().length < 2) {
      setError({ key: 'login.errors.fullName' })
      return
    }

    if (!isLogin && password.length < 8) {
      setError({ key: 'login.errors.password' })
      return
    }

    setPending(true)
    try {
      const session = isLogin
        ? await login({ phone: normalizedPhone, password })
        : await register({ phone: normalizedPhone, password, fullName: fullName.trim() })
      saveSession(session)
      navigate(destinationForSession(session), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? { text: submitError.message } : { key: 'login.errors.network' })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className='grid min-h-dvh bg-canvas lg:grid-cols-2'>
      <aside className='relative hidden min-h-dvh overflow-hidden lg:block'>
        <motion.img
          src='/images/screen.png'
          alt={t('login.imageAlt')}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-white/10' />

        <motion.div
          variants={stagger(0.18, 0.3)}
          initial='hidden'
          animate='show'
          className='relative flex h-full flex-col justify-between p-8 text-white'
        >
          <motion.div variants={fadeIn} className='flex items-start justify-between gap-4'>
            <Link to='/' className='inline-flex items-center gap-3'>
              <img src='/images/logo.png' alt='Dr Tina Beauty' className='h-14 w-auto rounded-full bg-white p-1' />
              <span>
                <span className='block text-sm font-extrabold tracking-wide'>DR TINA BEAUTY</span>
                <span className='block text-[10px] tracking-[0.18em] uppercase'>Clinical & Aesthetic Spa</span>
              </span>
            </Link>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-clinic'>
              <Icon name='spa' size={16} />
              Sanctuary Rituals
            </span>
          </motion.div>

          <motion.div variants={fadeUp} className='max-w-md'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-clinic'>
              <Icon name='bolt' size={16} />
              {t('login.energySpace')}
            </span>
            <h1 className='mt-5 text-4xl leading-tight font-extrabold text-white'>
              {t('login.heroLead')}
              <span className='text-rose-soft italic'>{t('login.heroAccent')}</span>
              {t('login.heroTail')}
            </h1>
            <p className='mt-4 text-sm leading-6 text-white/90'>{t('login.heroText')}</p>
            <div className='mt-6 flex items-center gap-3'>
              <span className='inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-clinic'>
                <Icon name='verified_user' size={22} />
              </span>
              <span>
                <span className='block text-sm font-extrabold'>{t('login.expertsTitle')}</span>
                <span className='block text-xs text-white/80'>{t('login.expertsText')}</span>
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeIn} className='flex items-center justify-between text-xs text-white/85'>
            <span className='inline-flex items-center gap-1'>
              <Icon name='location_on' size={16} />
              {t('login.location')}
            </span>
            <span>Holistic Spa Sanctuary © {new Date().getFullYear()}</span>
          </motion.div>
        </motion.div>
      </aside>

      <main className='flex min-h-dvh flex-col px-5 py-6 sm:px-10'>
        <div className='flex items-center justify-between gap-4 text-sm'>
          <Link to='/' className='inline-flex items-center gap-1 font-semibold text-ink hover:text-clinic'>
            <Icon name='arrow_back' size={18} />
            <StableText i18nKey='login.backHome' align='start' />
          </Link>
          <div className='flex items-center gap-3'>
            <a href='tel:19001234' className='hidden items-center gap-1 text-muted hover:text-clinic sm:inline-flex'>
              <Icon name='support_agent' size={18} />
              <StableText i18nKey='login.support' align='end' />
            </a>
            <LanguageSwitcher />
          </div>
        </div>

        <motion.div
          variants={stagger(0.1, 0.15)}
          initial='hidden'
          animate='show'
          className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12'
        >
          <motion.p variants={fadeUp} className='text-xs font-bold tracking-[0.22em] text-clinic uppercase'>
            Dr Tina Client Portal
          </motion.p>
          <motion.div variants={fadeUp}>
            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className='mt-3 text-4xl font-extrabold tracking-tight text-ink'>
                  {isLogin ? t('login.welcomeBack') : t('login.createAccount')}
                </h2>
                <p className='mt-3 text-sm leading-6 text-muted'>
                  {isLogin ? t('login.loginIntro') : t('login.registerIntro')}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            variants={fadeUp}
            role='tablist'
            aria-label={t('login.accountType')}
            className='mt-8 grid grid-cols-2 rounded-full bg-mist p-1'
          >
            {(['login', 'register'] as const).map((value) => {
              const active = tab === value
              return (
                <button
                  key={value}
                  type='button'
                  role='tab'
                  id={`tab-${value}`}
                  aria-selected={active}
                  aria-controls='auth-panel'
                  className={`relative min-h-11 rounded-full text-sm font-bold transition-colors ${
                    active ? 'text-white' : 'text-ink hover:text-clinic'
                  }`}
                  onClick={() => selectTab(value)}
                >
                  {active ? (
                    <motion.span
                      layoutId='auth-tab'
                      className='absolute inset-0 rounded-full bg-clinic shadow-[0_8px_18px_var(--color-whisper-shadow)]'
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <span className='relative'>{value === 'login' ? t('login.login') : t('login.register')}</span>
                </button>
              )
            })}
          </motion.div>

          <motion.form
            variants={fadeUp}
            id='auth-panel'
            role='tabpanel'
            aria-labelledby={isLogin ? 'tab-login' : 'tab-register'}
            className='mt-6 space-y-5'
            onSubmit={onSubmit}
          >
            <AnimatePresence initial={false}>
              {isLogin ? null : (
                <motion.div
                  key='fullName'
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className='overflow-hidden'
                >
                  <label htmlFor='fullName' className='mb-2 block text-sm font-semibold text-ink'>
                    {t('login.fullName')} <span className='text-clinic'>*</span>
                  </label>
                  <div className='flex items-center gap-2 rounded-full border border-rose-soft bg-white px-4'>
                    <Icon name='person' size={18} className='text-muted' />
                    <input
                      id='fullName'
                      name='fullName'
                      type='text'
                      autoComplete='name'
                      required
                      minLength={2}
                      maxLength={100}
                      value={fullName}
                      placeholder={t('login.fullNamePlaceholder')}
                      className='h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted'
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <div className='mb-2 flex items-center justify-between text-sm'>
                <label htmlFor='phone' className='font-semibold text-ink'>
                  {t('login.phone')} <span className='text-clinic'>*</span>
                </label>
                <span className='text-xs text-muted'>{t('login.phoneHint')}</span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-rose-soft bg-white px-4'>
                <Icon name='call' size={18} className='text-muted' />
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  inputMode='numeric'
                  autoComplete='tel'
                  required
                  maxLength={16}
                  value={phone}
                  placeholder={t('login.phonePlaceholder')}
                  className='h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted'
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>

            <div>
              <div className='mb-2 flex items-center justify-between text-sm'>
                <label htmlFor='password' className='font-semibold text-ink'>
                  {t('login.password')} <span className='text-clinic'>*</span>
                </label>
                <span className='text-xs text-muted'>
                  {isLogin ? t('login.passwordHintLogin') : t('login.passwordHintRegister')}
                </span>
              </div>
              <div className='flex items-center gap-2 rounded-full border border-rose-soft bg-white px-4'>
                <Icon name='lock' size={18} className='text-muted' />
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  minLength={isLogin ? undefined : 8}
                  maxLength={128}
                  value={password}
                  placeholder={t('login.passwordPlaceholder')}
                  className='h-12 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted'
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type='button'
                  className='inline-flex min-h-11 min-w-11 items-center justify-center text-muted hover:text-clinic'
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {errorMessage ? (
                <motion.p
                  key='error'
                  role='alert'
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 3, 0] }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className='rounded-2xl bg-mist px-4 py-3 text-sm font-medium text-clinic'
                >
                  {errorMessage}
                </motion.p>
              ) : null}
            </AnimatePresence>

            <motion.button
              {...(pending ? {} : pressable)}
              type='submit'
              disabled={pending}
              className='inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clinic text-sm font-bold tracking-wide text-white uppercase shadow-[0_12px_28px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep disabled:cursor-not-allowed disabled:opacity-70'
            >
              {submitLabel}
              <Icon name='arrow_forward' size={18} className='text-white' />
            </motion.button>
          </motion.form>
        </motion.div>

        <footer className='mx-auto w-full max-w-md pb-2 text-center'>
          <nav className='flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold tracking-wide text-muted uppercase'>
            {legalLinks.map((item) => (
              <Link key={item.key} to={item.href} className='hover:text-clinic'>
                {t(`login.legal.${item.key}`)}
              </Link>
            ))}
          </nav>
          <p className='mt-3 text-xs text-muted'>DR TINA BEAUTY Hotline: 1900 1234</p>
        </footer>
      </main>
    </div>
  )
}
