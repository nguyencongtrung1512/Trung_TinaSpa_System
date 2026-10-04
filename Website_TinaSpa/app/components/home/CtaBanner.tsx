import { motion } from 'framer-motion'
import { MotionLink, fadeUp, inView, pressable, stagger } from '~/components/ui/motion'
import { StableText } from '~/components/ui/StableText'

export interface CtaBannerProps {
  readonly className?: string
}

export function CtaBanner({ className = '' }: CtaBannerProps) {
  return (
    <section id='dat-lich' className={`relative bg-canvas ${className}`}>
      <svg className='absolute h-0 w-0' aria-hidden='true'>
        <defs>
          <clipPath id='banner-wave-clip' clipPathUnits='objectBoundingBox'>
            {/* Sóng sâu: đáy sóng ~19%, đỉnh sóng ~2% chiều cao */}
            <path d='M 0,0.14 C 0.12,0.02 0.25,0.02 0.38,0.10 C 0.52,0.19 0.65,0.18 0.78,0.08 C 0.88,0.01 0.95,0.02 1,0.06 L 1,1 L 0,1 Z' />
          </clipPath>
        </defs>
      </svg>

      <div
        className='relative isolate overflow-hidden pt-40 pb-20 sm:pt-52 sm:pb-24'
        style={{ clipPath: 'url(#banner-wave-clip)' }}
      >
        <motion.img
          src='/images/background.png'
          alt=''
          aria-hidden='true'
          loading='lazy'
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className='absolute inset-0 -z-20 h-full w-full object-cover'
        />

        <div className='absolute inset-0 -z-10 bg-gradient-to-b from-white/30 via-transparent to-white/20' />

        <motion.div {...inView} variants={stagger(0.15)} className='mx-auto max-w-3xl px-4 text-center sm:px-6'>
          <motion.h2
            variants={fadeUp}
            className='text-3xl font-extrabold tracking-tight text-ink drop-shadow-sm sm:text-4xl'
          >
            <StableText i18nKey='cta.title' block align='center' />
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className='mx-auto mt-4 max-w-xl text-sm font-medium leading-6 text-ink/90 drop-shadow-sm'
          >
            <StableText i18nKey='cta.description' block align='center' />
          </motion.p>
          <motion.div variants={fadeUp}>
            <MotionLink
              to='/booking'
              {...pressable}
              className='mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-7 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-clinic-deep'
            >
              <StableText i18nKey='cta.button' />
            </MotionLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
