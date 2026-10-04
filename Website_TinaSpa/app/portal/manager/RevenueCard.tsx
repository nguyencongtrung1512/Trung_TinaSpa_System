import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import type { OverviewSnapshot } from '~/portal/manager/manager-overview.data'

function sparklinePath(points: readonly number[], width: number, height: number) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = width / (points.length - 1)
  return points
    .map((point, index) => {
      const x = index * step
      const y = height - ((point - min) / span) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export interface RevenueCardProps {
  readonly snapshot: OverviewSnapshot
}

export function RevenueCard({ snapshot }: RevenueCardProps) {
  const reduceMotion = useReducedMotion()
  const path = sparklinePath(snapshot.trend, 160, 28)

  return (
    <article className={`${portalCardClass} flex flex-col justify-between gap-6 p-6`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <p className='flex items-center gap-2 text-xs font-bold tracking-wide text-muted uppercase'>
          <span className='size-2 rounded-full bg-emerald-500' />
          {snapshot.revenueLabel}
        </p>
        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'>
          <Icon name='trending_up' size={16} />
          {snapshot.change}
        </span>
      </div>

      <motion.p
        key={snapshot.revenue}
        className='text-4xl font-extrabold tracking-tight text-clinic-deep sm:text-5xl'
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {snapshot.revenue}
        <span className='ml-1 text-2xl text-ink'>đ</span>
      </motion.p>

      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <span className='text-xs font-semibold text-muted'>{snapshot.trendLabel}</span>
          <svg viewBox='-2 -2 164 32' className='h-8 w-40' aria-hidden>
            <motion.path
              key={path}
              d={path}
              fill='none'
              stroke='#16a34a'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
        </div>
        <Link to='/portal/manager/doanh-thu' className='inline-flex items-center gap-1 text-sm font-bold text-clinic'>
          Xem báo cáo chi tiết
          <Icon name='arrow_forward' size={16} />
        </Link>
      </div>
    </article>
  )
}
