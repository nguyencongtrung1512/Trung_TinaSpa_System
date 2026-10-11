import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { formatPrice } from '~/portal/manager/services/catalog.api'
import { changeLabel, type Overview, type OverviewRange } from '~/portal/overview.api'
import { portalCardClass } from '~/portal/styles'

const revenueLabels: Record<OverviewRange, string> = {
  today: 'Doanh thu dịch vụ hôm nay',
  week: 'Doanh thu dịch vụ 7 ngày',
  month: 'Doanh thu dịch vụ 30 ngày'
}

const trendLabels: Record<OverviewRange, string> = {
  today: 'Theo giờ',
  week: 'Xu hướng 7 ngày',
  month: 'Xu hướng 30 ngày'
}

function sparklinePath(points: readonly number[], width: number, height: number) {
  const max = Math.max(...points, 0)
  const step = points.length > 1 ? width / (points.length - 1) : 0
  return points
    .map((point, index) => {
      const x = index * step
      const y = max === 0 ? height : height - (point / max) * height
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export interface RevenueCardProps {
  readonly range: OverviewRange
  readonly overview?: Overview
  readonly loading: boolean
}

export function RevenueCard({ range, overview, loading }: RevenueCardProps) {
  const reduceMotion = useReducedMotion()
  const path = sparklinePath(overview?.trend ?? [0, 0], 160, 28)
  const change = overview ? changeLabel(overview.revenue, overview.previousRevenue) : null
  const rising = overview ? overview.revenue >= overview.previousRevenue : true

  return (
    <article className={`${portalCardClass} flex flex-col justify-between gap-6 p-6`}>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <p className='flex items-center gap-2 text-xs font-bold tracking-wide text-muted uppercase'>
          <span className='size-2 rounded-full bg-emerald-500' />
          {revenueLabels[range]}
        </p>
        {change ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              rising ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            <Icon name={rising ? 'trending_up' : 'trending_down'} size={16} />
            {change}
          </span>
        ) : null}
      </div>

      <motion.p
        key={overview?.revenue ?? 'loading'}
        className='text-4xl font-extrabold tracking-tight text-clinic-deep sm:text-5xl'
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading && !overview ? '–' : formatPrice(overview?.revenue ?? 0)}
      </motion.p>

      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <span className='text-xs font-semibold text-muted'>{trendLabels[range]}</span>
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
        <Link
          to='/portal/manager/customer-services'
          className='inline-flex items-center gap-1 text-sm font-bold text-clinic'
        >
          Ghi dịch vụ cho khách
          <Icon name='arrow_forward' size={16} />
        </Link>
      </div>
    </article>
  )
}
