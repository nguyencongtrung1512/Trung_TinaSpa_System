import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTestimonials } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { fadeUp, hoverLift, inView, scaleIn, stagger } from '~/components/ui/motion'

export interface TestimonialsProps {
  readonly className?: string
}

export function Testimonials({ className = '' }: TestimonialsProps) {
  const { t } = useTranslation()
  const testimonials = useTestimonials()

  return (
    <section className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 pb-20 sm:px-6'>
        <motion.div {...inView} variants={stagger(0.1)} className='mx-auto mb-12 max-w-2xl text-center'>
          <motion.p variants={fadeUp} className='text-sm font-semibold tracking-wide text-clinic'>
            {t('testimonials.eyebrow')}
          </motion.p>
          <motion.h2 variants={fadeUp} className='mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
            {t('testimonials.title')}
          </motion.h2>
        </motion.div>

        <motion.div {...inView} variants={stagger(0.15)} className='grid gap-5 md:grid-cols-3'>
          {testimonials.map((item) => (
            <motion.blockquote
              key={item.name}
              variants={fadeUp}
              {...hoverLift}
              className='rounded-2xl bg-surface p-6 shadow-[0_10px_30px_var(--color-whisper-shadow)]'
            >
              <motion.div variants={stagger(0.06, 0.3)} className='mb-3 flex gap-0.5 text-clinic'>
                {Array.from({ length: 5 }, (_, index) => (
                  <motion.span key={index} variants={scaleIn} className='inline-flex'>
                    <Icon name='star' className='text-[18px]' filled />
                  </motion.span>
                ))}
              </motion.div>
              <p className='text-sm leading-6 text-muted'>{item.quote}</p>
              <footer className='mt-5'>
                <p className='text-sm font-extrabold text-ink'>{item.name}</p>
                <p className='text-xs text-muted'>{item.detail}</p>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
