export interface WaveDividerProps {
  readonly fill: 'mist' | 'canvas' | 'surface'
  readonly flip?: boolean
  readonly className?: string
}

const fills = {
  mist: 'var(--color-mist)',
  canvas: 'var(--color-canvas)',
  surface: 'var(--color-surface)'
} as const

export function WaveDivider({ fill, flip = false, className = '' }: WaveDividerProps) {
  return (
    <div className={`leading-none ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden>
      <svg className='block h-12 w-full sm:h-16' viewBox='0 0 1440 80' preserveAspectRatio='none'>
        <path
          fill={fills[fill]}
          d='M0 28C180 68 360 80 540 62C780 38 980 4 1200 18C1320 26 1388 40 1440 48V80H0V28Z'
        />
      </svg>
    </div>
  )
}
