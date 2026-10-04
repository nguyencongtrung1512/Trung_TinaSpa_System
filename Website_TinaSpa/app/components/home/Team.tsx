import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTeam } from '~/data/home'
import { fadeUp, hoverLift, inView, stagger } from '~/components/ui/motion'

export interface TeamProps {
  readonly className?: string
}

export function Team({ className = '' }: TeamProps) {
  const { t } = useTranslation()
  const team = useTeam()

  return (
    <section id='doi-ngu' className={`bg-canvas ${className}`}>
      <div className='mx-auto max-w-6xl px-4 py-20 sm:px-6'>
        <motion.div {...inView} variants={stagger(0.1)} className='mx-auto mb-12 max-w-2xl text-center'>
          <motion.p variants={fadeUp} className='text-sm font-semibold tracking-wide text-clinic'>
            {t('team.eyebrow')}
          </motion.p>
          <motion.h2 variants={fadeUp} className='mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
            {t('team.title')}
          </motion.h2>
        </motion.div>

        <motion.div {...inView} variants={stagger(0.15)} className='grid gap-6 md:grid-cols-3'>
          {team.map((member) => (
            <motion.article
              key={member.id}
              variants={fadeUp}
              {...hoverLift}
              className='group overflow-hidden rounded-2xl bg-surface shadow-[0_10px_30px_var(--color-whisper-shadow)]'
            >
              <div className='aspect-[4/5] overflow-hidden bg-mist'>
                <img
                  src={member.image}
                  alt={member.imageAlt}
                  className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                />
              </div>
              <div className='px-5 py-5 text-center'>
                <h3 className='text-lg font-extrabold text-ink'>{member.name}</h3>
                <p className='mt-1 text-sm text-clinic'>{member.role}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
