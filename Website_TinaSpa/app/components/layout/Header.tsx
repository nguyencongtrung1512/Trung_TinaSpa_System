import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { brand, useNavLinks } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { LanguageSwitcher } from '~/components/ui/LanguageSwitcher'
import { StableText } from '~/components/ui/StableText'
import { useSession } from '~/lib/auth'

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
  const accountName = useSession()?.user.fullName ?? null
  const [isScrolled, setIsScrolled] = useState(false) // State kiểm tra đã scroll chưa
  const location = useLocation()
  const { t } = useTranslation()
  const navLinks = useNavLinks()

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

          {/* Chưa đăng nhập: hiện nút Đăng nhập. Đã đăng nhập: ẩn hoàn toàn */}
          {!accountName ? (
            <Link
              to='/login'
              aria-current={location.pathname === '/login' ? 'page' : undefined}
              className='hidden whitespace-nowrap rounded-full border border-clinic px-5 py-2.5 text-sm font-semibold text-clinic transition hover:bg-mist sm:inline-flex'
            >
              <StableText i18nKey='common.login' />
            </Link>
          ) : null}

          <Link
            to='/booking'
            className='hidden whitespace-nowrap rounded-full bg-clinic px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep sm:inline-flex'
          >
            <StableText i18nKey='common.bookNow' />
          </Link>

          {/* Đã đăng nhập: hiện tên tài khoản ở ngoài cùng bên phải */}
          {accountName ? (
            <Link
              to='/account'
              title={accountName}
              aria-current={location.pathname === '/account' ? 'page' : undefined}
              className='hidden max-w-44 items-center gap-2 rounded-full border border-clinic/30 bg-mist/60 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-clinic transition hover:border-clinic hover:bg-mist sm:inline-flex'
            >
              <span
                aria-hidden='true'
                className='flex size-8 shrink-0 items-center justify-center rounded-full bg-clinic text-white'
              >
                <Icon name='person' className='text-[20px]' />
              </span>
              <span className='truncate'>{accountName}</span>
            </Link>
          ) : null}

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
              )
            })}

            {/* Đã đăng nhập: chỉ hiện tên tài khoản, ẩn nút Đăng nhập */}
            {accountName ? (
              <Link
                to='/account'
                onClick={() => setOpen(false)}
                aria-current={location.pathname === '/account' ? 'page' : undefined}
                className='mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-5 py-2.5 text-sm font-semibold text-clinic'
              >
                <span className='truncate'>{accountName}</span>
              </Link>
            ) : (
              <Link
                to='/login'
                onClick={() => setOpen(false)}
                className='mt-2 inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-5 py-2.5 text-sm font-semibold text-clinic'
              >
                {t('common.login')}
              </Link>
            )}
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