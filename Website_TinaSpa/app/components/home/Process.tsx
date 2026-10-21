import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useProcessSteps, type ProcessStep } from '~/data/home'
import { homeContentApi, pickText, useRemote } from '~/lib/home-content'
import { Icon } from '~/components/ui/Icon'
import { fadeUp, inView, stagger } from '~/components/ui/motion'

export interface ProcessProps {
  readonly className?: string
}

/** 3, 5 or 6 steps sit better in rows of three than in a ragged row of four. */
function stepColumns(count: number) {
  if (count === 1) return ''
  if (count === 2) return 'sm:grid-cols-2'
  if (count === 3 || count === 5 || count === 6) return 'sm:grid-cols-2 lg:grid-cols-3'
  return 'sm:grid-cols-2 lg:grid-cols-4'
}

export function Process({ className = '' }: ProcessProps) {
  const { t, i18n } = useTranslation()
  const english = i18n.language.startsWith('en')
  const fallback = useProcessSteps()
  const remote = useRemote(homeContentApi.getProcess)
  // Built-in content when the API is unreachable, so the section never disappears.
  const processSteps: readonly ProcessStep[] | undefined =
    remote === null
      ? fallback
      : remote?.steps.map((step, index) => ({
          step: String(index + 1).padStart(2, '0'),
          icon: step.icon,
          title: pickText(english, step.titleVietnamese, step.titleEnglish),
          description: pickText(english, step.descriptionVietnamese, step.descriptionEnglish)
        }))

  return (
    <section className={`bg-mist py-20 sm:py-24 ${className}`}>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        {/* Header */}
        <motion.div
          {...inView}
          variants={stagger(0.12)}
          className='mb-12 flex flex-col gap-4 border-b border-ink/10 pb-8 sm:flex-row sm:items-end sm:justify-between'
        >
          <motion.div variants={fadeUp}>
            <p className='flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-clinic'>
              <motion.span
                className='h-px w-8 origin-left bg-clinic'
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.6, delay: 0.2 } } }}
              />
              {t('process.eyebrow')}
            </p>
            <h2 className='mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl'>
              {t('process.title', { count: processSteps?.length ?? fallback.length })}
            </h2>
          </motion.div>
          <motion.p variants={fadeUp} className='max-w-xs text-sm leading-relaxed text-muted'>
            {t('process.description')}
          </motion.p>
        </motion.div>

        {/* Steps */}
        {processSteps === undefined ? (
          <div className='grid gap-px sm:grid-cols-2 lg:grid-cols-4' aria-busy='true'>
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className='h-64 animate-pulse bg-surface/70' />
            ))}
          </div>
        ) : (
          <motion.ol
            {...inView}
            variants={stagger(0.12)}
            className={`grid border-t border-l border-ink/10 bg-surface ${stepColumns(processSteps.length)}`}
          >
            {processSteps.map((item) => (
              <motion.li
                key={item.step}
                variants={fadeUp}
                className='group relative flex flex-col border-r border-b border-ink/10 p-7 transition-colors duration-200 hover:bg-clinic'
              >
                {/* Số bước + icon */}
                <div className='flex items-start justify-between'>
                  <span className='text-5xl font-black leading-none tracking-tighter text-clinic/55 tabular-nums transition-colors duration-200 group-hover:text-surface/75'>
                    {String(item.step).padStart(2, '0')}
                  </span>
                  <motion.span
                    className='inline-flex'
                    whileHover={{ rotate: [0, -12, 12, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon
                      name={item.icon}
                      className='text-xl text-clinic transition-colors duration-200 group-hover:text-surface'
                    />
                  </motion.span>
                </div>

                {/* Nội dung */}
                <h3 className='mt-10 text-base font-bold text-ink transition-colors duration-200 group-hover:text-surface'>
                  {item.title}
                </h3>
                <p className='mt-2 text-sm leading-relaxed text-muted transition-colors duration-200 group-hover:text-surface/85'>
                  {item.description}
                </p>

                {/* Thanh nhấn dưới cùng */}
                <span className='absolute bottom-0 left-0 h-0.5 w-0 bg-clinic transition-all duration-300 group-hover:w-full' />
              </motion.li>
            ))}
          </motion.ol>
        )}
      </div>
    </section>
  )
}
