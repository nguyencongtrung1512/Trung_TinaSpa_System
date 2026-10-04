import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { brand, useFooterColumns } from '~/data/home'
import { Icon } from '~/components/ui/Icon'

export interface FooterProps {
  readonly className?: string
}

export function Footer({ className = '' }: FooterProps) {
  const { t } = useTranslation()
  const footerColumns = useFooterColumns()

  return (
    <footer id='lien-he' className={`relative isolate overflow-hidden bg-surface ${className}`}>
      {/* 1. Ảnh nền footer mờ */}
      <img
        src='/images/footer.png'
        alt=''
        aria-hidden='true'
        loading='lazy'
        className='absolute inset-0 -z-20 h-full w-full object-cover opacity-50'
      />

      {/* 2. Lớp phủ hòa trộn giúp chữ và biểu tượng giữ độ tương phản tốt */}
      <div className='absolute inset-0 -z-10 bg-surface/60' />

      <div className='mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4'>
        <div className='space-y-4'>
          <img src={brand.logo} alt={brand.name} className='h-14 w-auto' />
          <p className='max-w-xs text-sm leading-6 text-muted'>{t('footer.tagline')}</p>
        </div>

        <div>
          <h2 className='mb-4 text-sm font-extrabold tracking-wide text-ink'>{t('footer.explore')}</h2>
          <ul className='space-y-2.5'>
            {footerColumns.explore.map((item) => (
              <li key={item.label}>
                <Link to={item.href} className='text-sm text-muted transition hover:text-clinic'>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className='mb-4 text-sm font-extrabold tracking-wide text-ink'>{t('footer.services')}</h2>
          <ul className='space-y-2.5'>
            {footerColumns.care.map((item) => (
              <li key={item.label}>
                <Link to={item.href} className='text-sm text-muted transition hover:text-clinic'>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className='space-y-3'>
          <h2 className='mb-4 text-sm font-extrabold tracking-wide text-ink'>{t('footer.contact')}</h2>
          <p className='flex items-start gap-2 text-sm text-muted'>
            <Icon name='location_on' className='mt-0.5 text-clinic' />
            {t('brand.address')}
          </p>
          <p className='flex items-center gap-2 text-sm text-muted'>
            <Icon name='call' className='text-clinic' />
            {brand.phone}
          </p>
          <p className='flex items-center gap-2 text-sm text-muted'>
            <Icon name='mail' className='text-clinic' />
            {brand.email}
          </p>
          <p className='flex items-center gap-2 text-sm text-muted'>
            <Icon name='schedule' className='text-clinic' />
            {brand.hours}
          </p>
        </div>
      </div>

      <div className='relative z-10 border-t border-rose-soft/70'>
        <p className='mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted sm:px-6'>
          © {new Date().getFullYear()} {brand.name}. {t('footer.copyright')}
        </p>
      </div>
    </footer>
  )
}