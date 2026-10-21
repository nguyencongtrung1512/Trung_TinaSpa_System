import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Icon } from '~/components/ui/Icon'

export interface BeforeAfterSliderProps {
  readonly beforeSrc: string
  readonly afterSrc: string
  readonly beforeAlt: string
  readonly afterAlt: string
}

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt, afterAlt }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const trackRef = useRef<HTMLDivElement>(null)
  const touched = useRef(false)
  const visible = useInView(trackRef, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotion()
  const { t } = useTranslation()

  useEffect(() => {
    if (!visible || reduceMotion || touched.current) return
    const controls = animate(50, [50, 32, 68, 50], {
      duration: 2.2,
      delay: 0.4,
      ease: 'easeInOut',
      onUpdate: (latest) => {
        if (!touched.current) setPosition(latest)
      }
    })
    return () => controls.stop()
  }, [visible, reduceMotion])

  const moveTo = (clientX: number, track: HTMLDivElement) => {
    touched.current = true
    const rect = track.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }

  return (
    <div
      ref={trackRef}
      role='slider'
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-label={t('results.sliderLabel')}
      className='relative aspect-[4/3] cursor-ew-resize touch-none overflow-hidden rounded-2xl bg-mist select-none'
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        moveTo(event.clientX, event.currentTarget)
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
        moveTo(event.clientX, event.currentTarget)
      }}
      onKeyDown={(event) => {
        touched.current = true
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          setPosition((value) => Math.min(100, value + 5))
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          setPosition((value) => Math.max(0, value - 5))
        }
      }}
    >
      <img src={afterSrc} alt={afterAlt} draggable={false} className='absolute inset-0 h-full w-full object-cover' />
      <div className='absolute inset-y-0 left-0 overflow-hidden' style={{ width: `${position}%` }}>
        <img
          src={beforeSrc}
          alt={beforeAlt}
          draggable={false}
          className='absolute top-0 left-0 h-full max-w-none object-cover'
          style={{ width: position <= 0 ? 0 : `${(100 / position) * 100}%` }}
        />
      </div>

      <span className='pointer-events-none absolute top-3 left-3 rounded-full bg-ink/75 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white'>
        {t('results.before')}
      </span>
      <span className='pointer-events-none absolute top-3 right-3 rounded-full bg-clinic px-2.5 py-1 text-[10px] font-bold tracking-wide text-white'>
        {t('results.after')}
      </span>

      <div className='pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-clinic' style={{ left: `${position}%` }} />
      <div
        className='pointer-events-none absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2'
        style={{ left: `${position}%` }}
      >
        <motion.span
          className='flex h-9 w-9 items-center justify-center rounded-full border-2 border-clinic bg-white text-clinic shadow-sm'
          animate={{ boxShadow: ['0 0 0 0 rgba(219,39,119,0.35)', '0 0 0 10px rgba(219,39,119,0)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        >
          <Icon name='swap_horiz' className='text-[20px]' />
        </motion.span>
      </div>
    </div>
  )
}
