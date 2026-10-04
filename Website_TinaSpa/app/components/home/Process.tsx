import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useProcessSteps } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { fadeUp, inView, stagger } from '~/components/ui/motion'

export interface ProcessProps {
  readonly className?: string
}

export function Process({ className = '' }: ProcessProps) {
  const { t } = useTranslation()
  const processSteps = useProcessSteps()

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
              {t('process.title')}
            </h2>
          </motion.div>
          <motion.p variants={fadeUp} className='max-w-xs text-sm leading-relaxed text-muted'>
            {t('process.description')}
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.ol
          {...inView}
          variants={stagger(0.12)}
          className='grid border-t border-l border-ink/10 bg-surface sm:grid-cols-2 lg:grid-cols-4'
        >
          {processSteps.map((item) => (
            <motion.li
              key={item.step}
              variants={fadeUp}
              className='group relative flex flex-col border-r border-b border-ink/10 p-7 transition-colors duration-200 hover:bg-clinic'
            >
              {/* Số bước + icon */}
              <div className='flex items-start justify-between'>
                <span className='text-5xl font-extrabold leading-none tracking-tighter text-clinic/20 tabular-nums transition-colors duration-200 group-hover:text-surface/40'>
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
      </div>
    </section>
  )
}
