import { useCallback, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useSession } from '~/lib/auth'
import { localDateIso } from '~/lib/booking'
import type { Appointment } from '~/portal/appointments/appointments.api'
import { TodayBookings } from '~/portal/appointments/TodayBookings'
import { useAppointmentActions } from '~/portal/appointments/useAppointmentActions'
import { useAppointments, useBranches } from '~/portal/appointments/useAppointments'
import { ProposalBoard } from '~/portal/staff/ProposalBoard'
import { ServiceBoard, serviceStatuses } from '~/portal/staff/ServiceBoard'
import { ServicePanel } from '~/portal/staff/ServicePanel'
import { formatPortalDate } from '~/portal/format'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'

export function StaffDeskPage() {
  const reduceMotion = useReducedMotion()
  const name = useSession()?.user.fullName ?? ''
  const branches = useBranches()
  const today = localDateIso()

  // Fetch pending customer bookings from website (across all dates, so staff never misses a new booking)
  const pendingQuery = useAppointments({ status: 'PENDING' }, 30_000)
  // Fetch today's appointments for service board and today's schedule
  const todayQuery = useAppointments({ date: today }, 30_000)

  const [selectedID, setSelectedID] = useState<string | null>(null)

  const refreshAll = useCallback(async () => {
    await Promise.all([pendingQuery.refresh(), todayQuery.refresh()])
  }, [pendingQuery.refresh, todayQuery.refresh])

  const onChanged = useCallback(
    (next: Appointment) => {
      pendingQuery.replace(next)
      todayQuery.replace(next)
      void refreshAll()
    },
    [pendingQuery.replace, todayQuery.replace, refreshAll]
  )
  const actions = useAppointmentActions(branches, onChanged)

  const pending = pendingQuery.items
  const serving = todayQuery.items.filter((item) => serviceStatuses.includes(item.status))
  const selected = serving.find((item) => item.appointmentID === selectedID) ?? null

  const confirmedToday = todayQuery.items.filter((item) => item.status === 'CONFIRMED')

  const stats = [
    { label: 'Lịch hẹn hôm nay', value: todayQuery.items.length, unit: 'ca', tone: 'text-ink' },
    { label: 'Chờ xác nhận', value: pending.length, unit: 'lịch', tone: 'text-orange-500' },
    { label: 'Đã xác nhận hôm nay', value: confirmedToday.length, unit: 'lịch', tone: 'text-emerald-600' }
  ]

  const isLoading = pendingQuery.loading || todayQuery.loading

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='max-w-xl'>
          <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
            <span>{portalRoleLabel.staff}</span>
            <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
          </div>
          <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Xin chào, {name}</h1>
        </div>
        <ul className='grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[460px]'>
          {stats.map((stat) => (
            <li key={stat.label} className={`${portalCardClass} px-3 py-3`}>
              <p className='text-[11px] font-semibold text-muted'>{stat.label}</p>
              <p className={`mt-1 text-2xl font-extrabold ${stat.tone}`}>
                {isLoading ? '–' : String(stat.value).padStart(2, '0')}{' '}
                <span className='text-xs font-semibold'>{stat.unit}</span>
              </p>
            </li>
          ))}
        </ul>
      </header>

      <TodayBookings
        role='staff'
        items={pending}
        branches={branches}
        loading={pendingQuery.loading}
        error={pendingQuery.error}
        onRetry={() => void refreshAll()}
        onChanged={onChanged}
      />

      {todayQuery.error ? null : (
        <div className='mt-6 grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.78fr)]'>
          <ServiceBoard
            items={serving}
            loading={todayQuery.loading}
            selectedID={selected?.appointmentID ?? null}
            busyID={actions.busyID}
            pendingCount={pending.length}
            onSelect={setSelectedID}
            onAdvance={(appointment, status) => void actions.setStatus(appointment, status)}
          />
          <div className='xl:sticky xl:top-24'>
            <ServicePanel
              appointment={selected}
              busy={actions.busyID === selected?.appointmentID}
              onAdvance={(appointment, status) => void actions.setStatus(appointment, status)}
              onEdit={actions.edit}
              onCancel={actions.cancel}
              onSaved={onChanged}
            />
          </div>
        </div>
      )}

      {actions.elements}

      <ProposalBoard />
    </motion.div>
  )
}
