import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import type { Branch } from '~/lib/booking'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import type { Appointment } from './appointments.api'
import { AppointmentList } from './AppointmentList'

/** Today's website bookings still waiting for a confirmation call. */
export function TodayBookings({
  role,
  items,
  branches,
  loading,
  error,
  onRetry,
  onChanged
}: {
  readonly role: PortalRole
  readonly items: readonly Appointment[]
  readonly branches: readonly Branch[]
  readonly loading: boolean
  readonly error?: string
  readonly onRetry: () => void
  readonly onChanged: (appointment: Appointment) => void
}) {
  return (
    <section className='mt-5' aria-labelledby='today-bookings-title'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h2
          id='today-bookings-title'
          className='flex flex-wrap items-center gap-2 text-base font-extrabold text-ink sm:text-lg'
        >
          <span className='relative flex size-2'>
            {items.length > 0 ? (
              <span className='absolute inline-flex size-full animate-ping rounded-full bg-amber-500/60' />
            ) : null}
            <span className='relative inline-flex size-2 rounded-full bg-amber-500' />
          </span>
          Khách đặt hẹn website — chờ xác nhận
          <span className='text-sm font-medium text-muted'>{loading ? '…' : `${items.length} lịch`}</span>
        </h2>
        <Link to={`/portal/${role}/appointments`} className='text-sm font-semibold text-clinic'>
          Quản lý lịch hẹn →
        </Link>
      </div>

      {error ? (
        <div
          className={`${portalCardClass} flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm text-ink`}
        >
          <span className='flex items-center gap-2'>
            <Icon name='cloud_off' size={18} className='text-clinic' />
            {error}
          </span>
          <button type='button' className='font-semibold text-clinic' onClick={onRetry}>
            Thử lại
          </button>
        </div>
      ) : loading ? (
        <div className={`${portalCardClass} h-24 animate-pulse`} />
      ) : items.length === 0 ? (
        <p className={`${portalCardClass} flex items-center gap-2 px-5 py-4 text-sm text-muted`}>
          <Icon name='task_alt' size={18} className='text-emerald-600' />
          Không có lịch đặt hẹn nào chờ xác nhận.
        </p>
      ) : (
        <AppointmentList items={items} branches={branches} showDate emptyText='' onChanged={onChanged} />
      )}
    </section>
  )
}
