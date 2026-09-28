import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'

export interface BeforeAfterSliderProps {
  readonly beforeSrc: string
  readonly afterSrc: string
  readonly beforeAlt: string
  readonly afterAlt: string
  readonly result: string
  readonly note: string
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  result,
  note
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)

  const moveTo = (clientX: number, track: HTMLDivElement) => {
    const rect = track.getBoundingClientRect()
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }

  return (
    <div
      role='slider'
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-label='So sánh trước và sau. Kéo sang phải để xem before, kéo sang trái để xem after.'
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
        BEFORE
      </span>
      <span className='pointer-events-none absolute top-3 right-3 rounded-full bg-clinic px-2.5 py-1 text-[10px] font-bold tracking-wide text-white'>
        AFTER
      </span>

      <div className='pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-clinic' style={{ left: `${position}%` }} />
      <div
        className='pointer-events-none absolute top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-clinic bg-white text-clinic shadow-sm'
        style={{ left: `${position}%` }}
      >
        <Icon name='swap_horiz' className='text-[20px]' />
      </div>

      <div className='pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent px-4 pt-10 pb-3 text-center'>
        <p className='text-sm font-extrabold text-ink'>{result}</p>
        <p className='mt-1 text-xs text-muted'>{note}</p>
        <span className='mt-2 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-medium text-muted shadow-sm'>
          Kéo sang phải xem before, kéo sang trái xem after
        </span>
      </div>
    </div>
  )
}
