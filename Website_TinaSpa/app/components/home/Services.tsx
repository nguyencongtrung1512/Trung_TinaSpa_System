import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useServiceMenus, type ServiceMenu } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'

export interface ServicesProps {
  readonly className?: string
}

function startingPrice(menu: ServiceMenu) {
  const min = Math.min(...menu.items.map((item) => Number(item.price.replace(/\D/g, ''))))
  return `${min.toLocaleString('vi-VN')}k`
}

export function Services({ className = '' }: ServicesProps) {
  const reduceMotion = useReducedMotion()
  const { t } = useTranslation()
  const serviceMenus = useServiceMenus()

  return (
    <section id='dich-vu' className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <div className='flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end'>
          <div className='max-w-2xl'>
            <p className='text-sm font-semibold tracking-wide text-clinic'>{t('homeServices.eyebrow')}</p>
            <h2 className='mt-2 font-sans text-3xl text-ink sm:text-4xl'>{t('homeServices.title')}</h2>
          </div>
          <Link
            to='/services'
            className='inline-flex items-center gap-1 text-sm font-semibold text-clinic transition hover:text-clinic-deep'
          >
            <StableText i18nKey='homeServices.viewMenu' align='start' />
            <Icon name='arrow_forward' size={18} />
          </Link>
        </div>

        <div className='mt-10 grid gap-6 md:grid-cols-3'>
          {serviceMenus.map((menu, index) => (
            <motion.div
              key={menu.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : index * 0.1, ease: 'easeOut' }}
            >
              <Link
                to={`/services#${menu.id}`}
                className='group block overflow-hidden rounded-[1.35rem] bg-surface shadow-[0_12px_32px_var(--color-whisper-shadow)] transition hover:-translate-y-1'
              >
                <div className='overflow-hidden'>
                  <img
                    src={menu.image}
                    alt={menu.imageAlt}
                    loading='lazy'
                    className='aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105'
                  />
                </div>
                <div className='flex items-center justify-between gap-4 p-5'>
                  <div>
                    <h3 className='font-serif text-2xl text-clinic-deep'>{menu.title}</h3>
                    <p className='mt-1 text-xs text-muted'>
                      {t('homeServices.summary', { count: menu.items.length, price: startingPrice(menu) })}
                    </p>
                  </div>
                  <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-soft text-clinic transition group-hover:bg-clinic group-hover:text-white'>
                    <Icon name='arrow_forward' size={20} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
