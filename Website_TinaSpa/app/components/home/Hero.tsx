import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { heroLinks } from '~/data/home'
import { Icon } from '~/components/ui/Icon'
import { MotionLink, fadeUp, pressable, scaleIn, stagger } from '~/components/ui/motion'
import { StableText } from '~/components/ui/StableText'

export interface HeroProps {
  readonly className?: string
}

export function Hero({ className = '' }: HeroProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)

  // Browsers only autoplay muted video; visitors who prefer reduced motion get the still poster.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reduceMotion) {
      video.pause()
      return
    }
    video.muted = true
    void video.play().catch(() => setPlaying(false))
  }, [reduceMotion])

  function toggleSound() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    if (video.paused) void video.play()
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play()
    else video.pause()
  }

  return (
    <section className={className}>
      <div className='mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20'>
        <motion.div variants={stagger(0.12, 0.1)} initial='hidden' animate='show'>
          <motion.p variants={fadeUp} className='mb-4 text-sm font-semibold tracking-wide text-clinic'>
            <StableText i18nKey='hero.eyebrow' block />
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className='max-w-xl text-4xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl'
          >
            <StableText i18nKey='hero.title' block />
          </motion.h1>
          <motion.p variants={fadeUp} className='mt-5 max-w-lg text-base leading-7 text-muted'>
            <StableText i18nKey='hero.description' block />
          </motion.p>
          <motion.div variants={fadeUp} className='mt-8 flex flex-wrap items-center gap-3'>
            <MotionLink
              to={heroLinks.primary}
              {...pressable}
              className='inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_var(--color-whisper-shadow)] transition-colors hover:bg-clinic-deep'
            >
              <StableText i18nKey='hero.primaryCta' />
            </MotionLink>
            <MotionLink
              to={heroLinks.secondary}
              {...pressable}
              className='inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-6 py-3 text-sm font-semibold text-clinic transition-colors hover:bg-white'
            >
              <StableText i18nKey='hero.secondaryCta' />
            </MotionLink>
          </motion.div>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial='hidden'
          animate='show'
          className='relative mx-auto w-full max-w-[420px]'
        >
          <motion.div
            className='absolute inset-4 rounded-[2rem] bg-clinic/15 blur-2xl'
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='relative overflow-hidden rounded-[2rem] bg-mist shadow-[0_20px_50px_var(--color-whisper-shadow)]'
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <video
              ref={videoRef}
              src={heroLinks.video}
              poster={heroLinks.portrait}
              aria-label={t('hero.videoLabel')}
              className='aspect-[4/5] h-full w-full object-cover'
              muted
              loop
              playsInline
              preload='metadata'
              autoPlay={!reduceMotion}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            <div className='absolute right-4 bottom-4 flex gap-2'>
              <button
                type='button'
                className='grid size-10 place-items-center rounded-full bg-white/85 text-clinic shadow-md backdrop-blur transition hover:scale-105 hover:bg-white'
                aria-label={playing ? t('hero.pauseVideo') : t('hero.playVideo')}
                onClick={togglePlay}
              >
                <Icon name={playing ? 'pause' : 'play_arrow'} size={20} />
              </button>
              <button
                type='button'
                className='grid size-10 place-items-center rounded-full bg-white/85 text-clinic shadow-md backdrop-blur transition hover:scale-105 hover:bg-white'
                aria-label={muted ? t('hero.unmuteVideo') : t('hero.muteVideo')}
                aria-pressed={!muted}
                onClick={toggleSound}
              >
                <Icon name={muted ? 'volume_off' : 'volume_up'} size={20} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
