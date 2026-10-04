import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPortalDate } from '~/portal/format'
import { ApprovalQueue } from '~/portal/manager/ApprovalQueue'
import { RangeTabs } from '~/portal/manager/RangeTabs'
import { RevenueCard } from '~/portal/manager/RevenueCard'
import { TreatmentSchedule } from '~/portal/manager/TreatmentSchedule'
import { overviewSnapshots, type OverviewRange } from '~/portal/manager/manager-overview.data'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'

export function ManagerOverviewPage() {
  const [range, setRange] = useState<OverviewRange>('month')
  const snapshot = overviewSnapshots[range]
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel.manager}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Tổng quan chi nhánh</h1>
          <p className='mt-1 text-sm text-muted'>Theo dõi hoạt động và hiệu quả vận hành của chi nhánh.</p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </header>

      <div className='mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]'>
        <RevenueCard snapshot={snapshot} />
        <ul className='grid gap-3 sm:grid-cols-3'>
          {snapshot.metrics.map((metric, index) => (
            <motion.li
              key={`${range}-${metric.label}`}
              className={`${portalCardClass} flex flex-col justify-between gap-6 p-5`}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
            >
              <span className='grid size-10 place-items-center rounded-2xl bg-mist text-clinic'>
                <Icon name={metric.icon} size={20} />
              </span>
              <div>
                <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>{metric.label}</p>
                <p className='mt-1 text-3xl font-extrabold text-ink'>
                  {metric.value} <span className='text-sm font-semibold text-muted'>{metric.unit}</span>
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className='mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]'>
        <TreatmentSchedule />
        <div className='xl:sticky xl:top-24'>
          <ApprovalQueue />
        </div>
      </div>
    </motion.div>
  )
}
