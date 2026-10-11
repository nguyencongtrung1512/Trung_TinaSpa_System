import { motion } from 'framer-motion'
import { overviewRanges, type OverviewRange } from '~/portal/overview.api'

export interface RangeTabsProps {
  readonly value: OverviewRange
  readonly onChange: (value: OverviewRange) => void
}

export function RangeTabs({ value, onChange }: RangeTabsProps) {
  return (
    <div role='tablist' aria-label='Khoảng thời gian' className='inline-flex rounded-full bg-white p-1 shadow-sm'>
      {overviewRanges.map((range) => {
        const active = range.id === value
        return (
          <button
            key={range.id}
            type='button'
            role='tab'
            aria-selected={active}
            className={`relative rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              active ? 'text-white' : 'text-muted hover:text-ink'
            }`}
            onClick={() => onChange(range.id)}
          >
            {active ? (
              <motion.span
                layoutId='overview-range'
                className='absolute inset-0 rounded-full bg-clinic'
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className='relative'>{range.label}</span>
          </button>
        )
      })}
    </div>
  )
}
