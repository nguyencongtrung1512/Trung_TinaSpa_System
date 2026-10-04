import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'
import { useContent } from '~/i18n'

interface BranchText {
  readonly tab: string
  readonly name: string
  readonly description: string
  readonly address: string
  readonly hours: string
  readonly imageAlt: string
}

const branchItems = [
  {
    id: 'q1',
    hotlines: ['(028) 3823 6688', '1900 886 928'],
    email: 'contact.hcm@tinabeauty.vn',
    image: '/images/screen.png',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=12+Nguy%E1%BB%85n+Hu%E1%BB%87+Qu%E1%BA%ADn+1'
  },
  {
    id: 'hn',
    hotlines: ['(024) 3936 9988', '1900 886 928'],
    email: 'contact.han@tinabeauty.vn',
    image: '/images/screen1.png',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=45+L%C3%BD+Th%C6%B0%E1%BB%9Dng+Ki%E1%BB%87t+Ho%C3%A0n+Ki%E1%BA%BFm'
  }
] as const

export function ContactPage() {
  const reduceMotion = useReducedMotion()
  const { t } = useTranslation()
  const texts = useContent<Record<string, BranchText>>('contact.branches')
  const branches = branchItems.map((item) => ({ ...item, ...texts[item.id] }))
  const [activeId, setActiveId] = useState<string>(branches[0].id)
  const branch = branches.find((item) => item.id === activeId) ?? branches[0]

  return (
    <section className='bg-canvas'>
      <div className='mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20'>
        <div className='mx-auto max-w-2xl text-center'>
          <h1 className='font-serif text-4xl text-ink sm:text-5xl'>
            {t('contact.titleLead')} <em className='text-clinic-deep'>TinaSpa</em>
          </h1>
          <p className='mt-5 text-sm leading-7 text-muted'>{t('contact.intro')}</p>
          <div className='mt-6 flex items-center justify-center gap-3 text-clinic/60' aria-hidden>
            <span className='h-px w-12 bg-current' />
            <Icon name='spa' size={16} />
            <span className='h-px w-12 bg-current' />
          </div>
        </div>

        <div className='mt-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-[11px] font-bold tracking-[0.2em] text-clinic uppercase'>{t('contact.eyebrow')}</p>
            <h2 className='mt-2 font-serif text-3xl text-ink sm:text-4xl'>{t('contact.findUs')}</h2>
          </div>
          <div
            role='tablist'
            aria-label={t('contact.chooseBranch')}
            className='inline-flex w-full flex-col gap-1 rounded-3xl border border-rose-soft bg-mist p-1.5 sm:w-auto sm:flex-row sm:rounded-full'
          >
            {branches.map((item) => {
              const active = item.id === activeId
              return (
                <button
                  key={item.id}
                  type='button'
                  role='tab'
                  aria-selected={active}
                  aria-controls='branch-panel'
                  onClick={() => setActiveId(item.id)}
                  className={`relative rounded-full px-5 py-2.5 text-xs font-bold tracking-wide uppercase transition-colors ${
                    active ? 'text-clinic-deep' : 'text-ink/60 hover:text-ink'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId='branch-tab'
                      className='absolute inset-0 rounded-full bg-white shadow-sm'
                      transition={{ duration: reduceMotion ? 0 : 0.3 }}
                    />
                  ) : null}
                  <StableText i18nKey={`contact.branches.${item.id}.tab`} className='relative' />
                </button>
              )
            })}
          </div>
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={branch.id}
            id='branch-panel'
            role='tabpanel'
            initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -16 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className='mt-14 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14'
          >
            <div>
              <h3 className='font-serif text-2xl text-ink sm:text-3xl'>
                <StableText i18nKey={`contact.branches.${branch.id}.name`} block />
              </h3>
              <p className='mt-3 text-sm leading-6 text-muted'>
                <StableText i18nKey={`contact.branches.${branch.id}.description`} block />
              </p>

              <dl className='mt-6 space-y-5 border-t border-ink/10 pt-6'>
                <ContactRow icon='location_on' label={t('contact.address')}>
                  <StableText i18nKey={`contact.branches.${branch.id}.address`} block />
                </ContactRow>
                <ContactRow icon='call' label={t('contact.hotline')}>
                  <span className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                    {branch.hotlines.map((phone, index) => (
                      <span key={phone} className='inline-flex items-center gap-3'>
                        {index > 0 ? <span className='h-1 w-1 rounded-full bg-clinic/40' aria-hidden /> : null}
                        <a
                          href={`tel:${phone.replace(/\D/g, '')}`}
                          className='font-semibold text-clinic-deep hover:underline'
                        >
                          {phone}
                        </a>
                      </span>
                    ))}
                  </span>
                </ContactRow>
                <ContactRow icon='mail' label={t('contact.email')}>
                  <a href={`mailto:${branch.email}`} className='hover:text-clinic'>
                    {branch.email}
                  </a>
                </ContactRow>
                <ContactRow icon='schedule' label={t('contact.hours')}>
                  <StableText i18nKey={`contact.branches.${branch.id}.hours`} block />
                </ContactRow>
              </dl>

              <div className='mt-8 flex flex-col items-start gap-3'>
                <Link
                  to='/booking'
                  className='inline-flex min-h-11 items-center gap-2 rounded-full bg-clinic px-6 py-2.5 text-xs font-bold tracking-wide text-white uppercase shadow-[0_10px_24px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
                >
                  <Icon name='calendar_month' size={18} />
                  <StableText i18nKey='contact.bookHere' />
                </Link>
                <a
                  href={branch.mapUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-2.5 text-xs font-bold text-ink transition hover:border-clinic hover:text-clinic'
                >
                  <Icon name='directions' size={18} />
                  <StableText i18nKey='contact.directions' />
                </a>
              </div>
            </div>

            <div className='overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_rgba(74,32,53,0.16)]'>
              <img src={branch.image} alt={branch.imageAlt} className='aspect-[4/3] w-full object-cover' />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function ContactRow({
  icon,
  label,
  children
}: {
  readonly icon: string
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <div className='flex gap-3'>
      <Icon name={icon} size={18} className='mt-0.5 text-clinic' />
      <div>
        <dt className='text-[10px] font-bold tracking-[0.16em] text-muted uppercase'>{label}</dt>
        <dd className='mt-1 text-sm text-ink'>{children}</dd>
      </div>
    </div>
  )
}
