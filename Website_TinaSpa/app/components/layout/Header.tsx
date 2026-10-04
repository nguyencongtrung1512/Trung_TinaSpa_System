import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { brand, useNavLinks } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { LanguageSwitcher } from '~/components/ui/LanguageSwitcher'
import { StableText } from '~/components/ui/StableText'
import { loadSession } from '~/lib/auth'

export interface HeaderProps {
  readonly className?: string
}

function isActivePath(href: string, pathname: string, hash: string) {
  if (href === '/') return pathname === '/' && hash === ''
  if (href.startsWith('/#')) return pathname === '/' && hash === href.slice(1)
  return pathname === href
}

export function Header({ className = '' }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const [accountName, setAccountName] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false) // State kiểm tra đã scroll chưa
  const location = useLocation()
  const { t } = useTranslation()
  const navLinks = useNavLinks()

  useEffect(() => {
    setAccountName(loadSession()?.user.fullName ?? null)
  }, [location.pathname])

  // Lắng nghe sự kiện cuộn trang (scroll)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Kiểm tra vị trí ngay khi component mount

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
        ? 'border-b border-rose-soft/40 bg-surface/70 backdrop-blur-sm shadow-sm'
        : 'border-b border-rose-soft/60 bg-surface/90 backdrop-blur-sm'
        } ${className}`}
    >
      <div className='mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
        <Link
          to='/'
          aria-label={brand.name}
          className='flex shrink-0 items-center gap-2'
          onClick={() => setOpen(false)}
        >
          <img src={brand.logo} alt='' className='h-16 w-auto' />
        </Link>

        <nav className='hidden shrink-0 items-center gap-6 lg:flex' aria-label={t('common.mainNav')}>
          {navLinks.map((item) => {
            const active = isActivePath(item.href, location.pathname, location.hash)
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative whitespace-nowrap py-1 text-sm font-semibold transition-colors ${active
                  ? 'text-clinic after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-clinic'
                  : 'text-ink/80 hover:text-clinic'
                  }`}
              >
                <StableText i18nKey={item.labelKey} />
              </Link>
            )
          })}
        </nav>

        <div className='flex items-center gap-3'>
          <LanguageSwitcher />
          <Link
            to='/login'
            aria-current={location.pathname === '/login' ? 'page' : undefined}
            className='hidden max-w-40 truncate rounded-full border border-clinic px-5 py-2.5 text-sm font-semibold text-clinic transition hover:bg-mist sm:inline-flex'
          >
            {accountName ?? <StableText i18nKey='common.login' />}
          </Link>
          <Link
            to='/booking'
            className='hidden whitespace-nowrap rounded-full bg-clinic px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep sm:inline-flex'
          >
            <StableText i18nKey='common.bookNow' />
          </Link>
          <button
            type='button'
            className='inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink lg:hidden'
            aria-expanded={open}
            aria-controls='mobile-nav'
            aria-label={open ? t('common.closeMenu') : t('common.openMenu')}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} className='text-[26px]' />
          </button>
        </div>
      </div>

      {open ? (
        <div id='mobile-nav' className='border-t border-rose-soft/60 bg-surface/95 backdrop-blur-md px-4 py-4 lg:hidden'>
          <nav className='flex flex-col gap-1' aria-label={t('common.mobileNav')}>
            {navLinks.map((item) => {
              const active = isActivePath(item.href, location.pathname, location.hash)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`border-b-2 px-3 py-3 text-sm font-semibold ${active ? 'border-clinic text-clinic' : 'border-transparent text-ink hover:text-clinic'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to='/login'
              onClick={() => setOpen(false)}
              className='mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-5 py-2.5 text-sm font-semibold text-clinic'
            >
              {accountName ?? t('common.login')}
            </Link>
            <Link
              to='/booking'
              onClick={() => setOpen(false)}
              className='inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-5 py-2.5 text-sm font-semibold text-white'
            >
              {t('common.bookNow')}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}