import { useTranslation } from 'react-i18next'
import { SiteShell } from '~/components/layout/SiteShell'
import { WaveDivider } from '~/components/home/WaveDivider'
import { Icon } from '~/components/ui/Icon'
import i18n from '~/i18n'

const values = ['01', '02', '03', '04'] as const

const signatures = ['spa', 'fingerprint', 'self_improvement'] as const

export function meta() {
  return [{ title: i18n.t('meta.about.title') }, { name: 'description', content: i18n.t('meta.about.description') }]
}

export default function About() {
  const { t } = useTranslation()

  return (
    <SiteShell>
      <section className='bg-canvas'>
        <div className='mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:py-24'>
          <div className='relative mx-auto w-full max-w-lg'>
            <img
              src='/images/screen.png'
              alt={t('about.imageMainAlt')}
              className='aspect-[4/5] w-[78%] rounded-[1.75rem] object-cover shadow-[0_18px_40px_var(--color-whisper-shadow)]'
            />
            <img
              src='/images/screen1.png'
              alt={t('about.imageSideAlt')}
              className='absolute top-8 right-0 aspect-[4/5] w-[58%] rounded-[1.5rem] border-4 border-white object-cover shadow-[0_16px_36px_var(--color-whisper-shadow)]'
            />
            <span className='absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-clinic uppercase'>
              {t('about.badge')}
            </span>
            <div className='absolute bottom-6 left-4 flex max-w-[240px] items-center gap-3 rounded-2xl bg-white/95 px-3 py-3 shadow-sm'>
              <span className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-clinic text-lg text-white'>
                ✦
              </span>
              <span>
                <span className='block text-sm font-extrabold text-ink'>{t('about.spaceTitle')}</span>
                <span className='mt-0.5 block text-xs leading-5 text-muted'>{t('about.spaceText')}</span>
              </span>
            </div>
          </div>

          <div>
            <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>{t('about.eyebrow')}</p>
            <h1 className='mt-4 text-4xl leading-tight font-extrabold tracking-tight text-ink sm:text-5xl'>
              {t('about.titleLead')}
              <span className='mt-1 block text-clinic'>{t('about.titleAccent')}</span>
            </h1>
            <p className='mt-5 max-w-xl text-sm leading-7 text-muted'>{t('about.intro')}</p>

            <div className='mt-10 grid gap-8 sm:grid-cols-2'>
              {values.map((index) => (
                <article key={index}>
                  <h2 className='text-lg font-extrabold text-ink'>
                    <span className='mr-2 text-clinic'>{index}</span>
                    {t(`about.values.${index}.title`)}
                  </h2>
                  <p className='mt-2 text-sm leading-6 text-muted'>{t(`about.values.${index}.description`)}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WaveDivider fill='mist' background='canvas' />
      <section className='bg-mist'>
        <div className='mx-auto max-w-6xl px-4 py-20 text-center sm:px-6'>
          <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>{t('about.signatureEyebrow')}</p>
          <h2 className='mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl'>
            {t('about.signatureTitle')} <span className='text-clinic'>Dr Tina Beauty</span>
          </h2>
          <p className='mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted'>{t('about.signatureIntro')}</p>

          <div className='mt-14 grid gap-10 md:grid-cols-3'>
            {signatures.map((icon) => (
              <article key={icon} className='px-4'>
                <span className='mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-soft text-clinic'>
                  <Icon name={icon} size={40} />
                </span>
                <h3 className='mt-5 text-lg font-extrabold text-ink'>
                  {t(`about.signatures.${icon}.lead`)}
                  <span className='text-clinic'>{t(`about.signatures.${icon}.accent`)}</span>
                </h3>
                <p className='mt-3 text-sm leading-6 text-muted'>{t(`about.signatures.${icon}.description`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider fill='mist' background='surface' flip />
    </SiteShell>
  )
}
