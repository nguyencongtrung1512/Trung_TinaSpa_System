import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { localDateIso } from '~/lib/booking'
import type { Appointment } from '~/portal/appointments/appointments.api'
import { useAppointmentActions } from '~/portal/appointments/useAppointmentActions'
import { useAppointments, useBranches } from '~/portal/appointments/useAppointments'
import { formatPortalDate } from '~/portal/format'
import { ApprovalQueue } from '~/portal/manager/ApprovalQueue'
import { RangeTabs } from '~/portal/manager/RangeTabs'
import { RevenueCard } from '~/portal/manager/RevenueCard'
import { TreatmentSchedule } from '~/portal/manager/TreatmentSchedule'
import { portalRoleLabel } from '~/portal/navigation'
import { useOverview, type OverviewRange } from '~/portal/overview.api'
import { portalCardClass } from '~/portal/styles'

const metricsFor = (range: OverviewRange) =>
  [
    {
      key: 'appointmentCount',
      label: range === 'today' ? 'Lịch hẹn hôm nay' : range === 'week' ? 'Lịch hẹn 7 ngày' : 'Lịch hẹn 30 ngày',
      unit: 'lịch',
      icon: 'calendar_month'
    },
    { key: 'newCustomers', label: 'Khách hàng mới', unit: 'hồ sơ', icon: 'person_add' },
    { key: 'serviceCount', label: 'Lượt dịch vụ đã ghi', unit: 'lượt', icon: 'spa' }
  ] as const

export function ManagerOverviewPage() {
  const [range, setRange] = useState<OverviewRange>('today')
  const reduceMotion = useReducedMotion()
  const overview = useOverview(range)
  const branches = useBranches()
  const today = localDateIso()

  const todayQuery = useAppointments({ date: today }, 30_000)
  const pendingQuery = useAppointments({ status: 'PENDING' }, 30_000)

  const onChanged = useCallback(
    (next: Appointment) => {
      todayQuery.replace(next)
      pendingQuery.replace(next)
      void Promise.all([todayQuery.refresh(), pendingQuery.refresh(), overview.refresh()])
    },
    [todayQuery.replace, todayQuery.refresh, pendingQuery.replace, pendingQuery.refresh, overview.refresh]
  )
  const actions = useAppointmentActions(branches, onChanged)
  const confirm = useCallback(
    (appointment: Appointment) => void actions.setStatus(appointment, 'CONFIRMED'),
    [actions.setStatus]
  )

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

      {overview.error ? (
        <p role='alert' className='mt-4 flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700'>
          <span className='flex items-center gap-2'>
            <Icon name='error' size={18} />
            {overview.error}
          </span>
          <button type='button' className='font-bold text-clinic' onClick={() => void overview.refresh()}>
            Thử lại
          </button>
        </p>
      ) : null}

      <div className='mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]'>
        <RevenueCard range={range} overview={overview.data} loading={overview.loading} />
        <ul className='grid gap-3 sm:grid-cols-3'>
          {metricsFor(range).map((metric, index) => (
            <motion.li
              key={`${range}-${metric.key}`}
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
                  {overview.data ? overview.data[metric.key] : '–'}{' '}
                  <span className='text-sm font-semibold text-muted'>{metric.unit}</span>
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className='mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]'>
        <TreatmentSchedule
          items={todayQuery.items}
          loading={todayQuery.loading}
          error={todayQuery.error}
          busyID={actions.busyID}
          onRetry={() => void todayQuery.refresh()}
          onConfirm={confirm}
        />
        <div className='xl:sticky xl:top-24'>
          <ApprovalQueue
            items={pendingQuery.items}
            loading={pendingQuery.loading}
            error={pendingQuery.error}
            busyID={actions.busyID}
            onConfirm={confirm}
          />
        </div>
      </div>

      {actions.elements}
    </motion.div>
  )
}
