import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useTeam, type TeamMember } from '~/data/home'
import { homeContentApi, pickText, useRemote } from '~/lib/home-content'
import { fadeUp, hoverLift, inView, stagger } from '~/components/ui/motion'

export interface TeamProps {
  readonly className?: string
}

/** Keeps 4 cards on one row and 2 cards from stretching across the whole width. */
function teamColumns(count: number) {
  if (count === 1) return 'mx-auto max-w-sm'
  if (count === 2) return 'mx-auto max-w-3xl sm:grid-cols-2'
  if (count === 4) return 'sm:grid-cols-2 lg:grid-cols-4'
  return 'sm:grid-cols-2 md:grid-cols-3'
}

export function Team({ className = '' }: TeamProps) {
  const { t, i18n } = useTranslation()
  const english = i18n.language.startsWith('en')
  const fallback = useTeam()
  const remote = useRemote(homeContentApi.getTeam)
  // Built-in content when the API is unreachable, so the section never disappears.
  const team: readonly TeamMember[] | undefined =
    remote === null
      ? fallback
      : remote?.members.map((member, index) => {
          const name = pickText(english, member.nameVietnamese, member.nameEnglish)
          return {
            id: String(index),
            name,
            role: pickText(english, member.roleVietnamese, member.roleEnglish),
            image: member.image,
            imageAlt: name
          }
        })

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

        {team === undefined ? (
          <div className='grid gap-6 md:grid-cols-3' aria-busy='true'>
            {[0, 1, 2].map((item) => (
              <div key={item} className='aspect-[4/5] animate-pulse rounded-2xl bg-surface/70' />
            ))}
          </div>
        ) : (
          <motion.div {...inView} variants={stagger(0.15)} className={`grid gap-6 ${teamColumns(team.length)}`}>
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
        )}
      </div>
    </section>
  )
}
