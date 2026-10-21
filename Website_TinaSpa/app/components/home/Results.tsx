import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { BeforeAfterSlider } from '~/components/home/BeforeAfterSlider'
import { Icon } from '~/components/ui/Icon'
import { MotionLink, fadeUp, inView, pressable, stagger } from '~/components/ui/motion'
import { StableText } from '~/components/ui/StableText'
import { treatmentResultsApi, type TreatmentResult } from '~/lib/treatment-results'

export interface ResultsProps {
  readonly className?: string
}

const pick = (english: boolean, vietnamese: string, translated: string | null) =>
  english && translated ? translated : vietnamese

export function Results({ className = '' }: ResultsProps) {
  const { t, i18n } = useTranslation()
  const english = i18n.language.startsWith('en')
  // undefined while loading; the section is hidden when the API fails or nothing is published.
  const [results, setResults] = useState<readonly TreatmentResult[]>()

  useEffect(() => {
    let cancelled = false
    treatmentResultsApi
      .list()
      .then((items) => {
        if (!cancelled) setResults(items)
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (results?.length === 0) return null

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

        {results === undefined ? (
          <div className='grid gap-5 lg:grid-cols-3' aria-busy='true'>
            {[0, 1, 2].map((item) => (
              <div key={item} className='h-[34rem] animate-pulse rounded-[1.75rem] bg-surface/70' />
            ))}
          </div>
        ) : (
          <motion.div {...inView} variants={stagger(0.15)} className='grid gap-5 lg:grid-cols-3'>
            {results.map((item, index) => {
              const title = pick(english, item.titleVietnamese, item.titleEnglish)
              const summary = item.summaryVietnamese ? pick(english, item.summaryVietnamese, item.summaryEnglish) : null
              return (
                <motion.article
                  key={item.treatmentResultID}
                  variants={fadeUp}
                  className='flex flex-col rounded-[1.75rem] border border-rose-soft/80 bg-surface p-4 shadow-[0_10px_30px_var(--color-whisper-shadow)]'
                >
                  <BeforeAfterSlider
                    beforeSrc={item.beforeImage}
                    afterSrc={item.afterImage}
                    beforeAlt={t('results.beforeAlt', { title })}
                    afterAlt={t('results.afterAlt', { title })}
                  />

                  <div className='flex flex-1 flex-col px-2 pt-5 pb-2'>
                    {/* Grows so the stats row lines up across cards with one- or two-line titles. */}
                    <div className='flex-1'>
                      <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>
                        {t('results.caseLabel', { n: String(index + 1).padStart(2, '0') })}
                      </p>
                      <h3 className='mt-2 text-xl font-extrabold text-ink'>{title}</h3>
                      <div className='mt-3 rounded-2xl bg-mist/60 px-4 py-3'>
                        <p className='flex items-start gap-1.5 text-sm font-extrabold text-clinic-deep'>
                          <Icon name='trending_up' size={18} className='mt-px shrink-0' />
                          {pick(english, item.resultVietnamese, item.resultEnglish)}
                        </p>
                        {summary ? <p className='mt-1 pl-6 text-xs leading-5 text-muted'>{summary}</p> : null}
                      </div>
                    </div>

                    <dl className='mt-5 grid grid-cols-2 gap-4 border-t border-rose-soft/70 pt-4'>
                      <div>
                        <dt className='text-[11px] font-semibold tracking-wide text-muted uppercase'>
                          <StableText i18nKey='results.sessions' block />
                        </dt>
                        <dd className='mt-1 text-lg font-extrabold text-ink'>
                          {t('results.sessionsValue', {
                            count: item.sessionCount,
                            value: String(item.sessionCount).padStart(2, '0')
                          })}
                        </dd>
                      </div>
                      <div>
                        <dt className='text-[11px] font-semibold tracking-wide text-muted uppercase'>
                          <StableText i18nKey='results.duration' block />
                        </dt>
                        <dd className='mt-1 text-lg font-extrabold text-ink'>
                          {t('results.durationValue', { count: item.durationWeeks })}
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
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
