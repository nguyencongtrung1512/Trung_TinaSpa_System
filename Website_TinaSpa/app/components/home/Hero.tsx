import { Link } from 'react-router'
import { hero } from '~/data/home'

export interface HeroProps {
  readonly className?: string
}

export function Hero({ className = '' }: HeroProps) {
  return (
    <section className={className}>
      <div className='mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20'>
        <div>
          <p className='mb-4 text-sm font-semibold tracking-wide text-clinic'>{hero.eyebrow}</p>
          <h1 className='max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl'>
            {hero.title}
          </h1>
          <p className='mt-5 max-w-lg text-base leading-7 text-muted'>{hero.description}</p>
          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <Link
              to={hero.primaryCta.href}
              className='inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              to={hero.secondaryCta.href}
              className='inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-6 py-3 text-sm font-semibold text-clinic transition hover:bg-white'
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className='relative mx-auto w-full max-w-[420px]'>
          <div className='absolute inset-4 rounded-[2rem] bg-clinic/15 blur-2xl' />
          <div className='relative overflow-hidden rounded-[2rem] bg-mist shadow-[0_20px_50px_var(--color-whisper-shadow)]'>
            <img
              src={hero.portrait.src}
              alt={hero.portrait.alt}
              className='aspect-[4/5] h-full w-full object-cover object-top'
            />
          </div>
        </div>
      </div>
    </section>
  )
}
