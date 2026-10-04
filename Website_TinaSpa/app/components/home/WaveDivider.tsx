import { motion, useReducedMotion } from 'framer-motion'

type WaveColor = 'mist' | 'canvas' | 'surface'

export interface WaveDividerProps {
  readonly fill: WaveColor
  readonly background?: WaveColor
  readonly flip?: boolean
  readonly className?: string
}

const fills = {
  mist: 'var(--color-mist)',
  canvas: 'var(--color-canvas)',
  surface: 'var(--color-surface)'
} as const

const waves = [
  'M0 28C180 68 360 80 540 62C780 38 980 4 1200 18C1320 26 1388 40 1440 48V80H0V28Z',
  'M0 40C200 20 380 50 560 56C800 64 1000 22 1200 30C1320 34 1390 26 1440 32V80H0V40Z'
] as const

export function WaveDivider({ fill, background, flip = false, className = '' }: WaveDividerProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={`leading-none ${flip ? 'rotate-180' : ''} ${className}`}
      style={background ? { backgroundColor: fills[background] } : undefined}
      aria-hidden
    >
      <svg className='block h-12 w-full sm:h-16' viewBox='0 0 1440 80' preserveAspectRatio='none'>
        <motion.path
          fill={fills[fill]}
          d={waves[0]}
          animate={reduceMotion ? undefined : { d: [waves[0], waves[1], waves[0]] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}
