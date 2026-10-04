import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useResultCases } from '~/data/home'
import { BeforeAfterSlider } from '~/components/home/BeforeAfterSlider'
import { MotionLink, fadeUp, inView, pressable, stagger } from '~/components/ui/motion'
import { StableText } from '~/components/ui/StableText'

export interface ResultsProps {
  readonly className?: string
}

export function Results({ className = '' }: ResultsProps) {
  const { t } = useTranslation()
  const resultCases = useResultCases()

  return (
    <section id='minh-chung' className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <motion.div {...inView} variants={stagger(0.1)} className='mx-auto mb-12 max-w-2xl text-center'>
          <motion.p variants={fadeUp} className='text-sm font-bold tracking-[0.22em] text-clinic'>
            {t('results.eyebrow')}
          </motion.p>
          <motion.h2 variants={fadeUp} className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
            {t('results.title')}
          </motion.h2>
          <motion.p variants={fadeUp} className='mt-3 text-sm leading-6 text-muted'>
            {t('results.description')}
          </motion.p>
        </motion.div>

        <motion.div {...inView} variants={stagger(0.15)} className='grid gap-5 lg:grid-cols-3'>
          {resultCases.map((item) => (
            <motion.article
              key={item.id}
              variants={fadeUp}
              className='flex flex-col rounded-[1.75rem] border border-rose-soft/80 bg-surface p-4 shadow-[0_10px_30px_var(--color-whisper-shadow)]'
            >
              <BeforeAfterSlider
                beforeSrc={item.beforeSrc}
                afterSrc={item.afterSrc}
                beforeAlt={item.beforeAlt}
                afterAlt={item.afterAlt}
                result={item.result}
                note={item.note}
              />

              <div className='flex flex-1 flex-col px-2 pt-5 pb-2'>
                <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>
                  <StableText i18nKey={`results.cases.${item.id}.label`} block />
                </p>
                <h3 className='mt-2 text-xl font-extrabold text-ink'>
                  <StableText i18nKey={`results.cases.${item.id}.title`} block />
                </h3>

                <dl className='mt-5 grid grid-cols-2 gap-4 border-t border-rose-soft/70 pt-4'>
                  <div>
                    <dt className='text-[11px] font-semibold tracking-wide text-muted uppercase'>
                      <StableText i18nKey='results.sessions' block />
                    </dt>
                    <dd className='mt-1 text-lg font-extrabold text-ink'>
                      <StableText i18nKey={`results.cases.${item.id}.sessions`} block />
                    </dd>
                  </div>
                  <div>
                    <dt className='text-[11px] font-semibold tracking-wide text-muted uppercase'>
                      <StableText i18nKey='results.duration' block />
                    </dt>
                    <dd className='mt-1 text-lg font-extrabold text-ink'>
                      <StableText i18nKey={`results.cases.${item.id}.duration`} block />
                    </dd>
                  </div>
                </dl>

                <MotionLink
                  to='/#dat-lich'
                  {...pressable}
                  className='mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-clinic/40 px-5 py-2.5 text-sm font-bold tracking-wide text-ink transition-colors hover:border-clinic hover:text-clinic'
                >
                  <StableText i18nKey='results.viewJourney' />
                </MotionLink>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
