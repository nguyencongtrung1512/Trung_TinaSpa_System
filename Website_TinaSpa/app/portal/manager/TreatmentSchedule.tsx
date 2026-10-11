import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import {
  appointmentStatusMeta,
  formatPhone,
  nextServiceStep,
  type Appointment
} from '~/portal/appointments/appointments.api'
import { portalCardClass } from '~/portal/styles'

export interface TreatmentScheduleProps {
  readonly items: readonly Appointment[]
  readonly loading: boolean
  readonly error?: string
  readonly busyID: string | null
  readonly onRetry: () => void
  readonly onConfirm: (appointment: Appointment) => void
}

export function TreatmentSchedule({ items, loading, error, busyID, onRetry, onConfirm }: TreatmentScheduleProps) {
  const reduceMotion = useReducedMotion()
  const active = items.filter((item) => item.status !== 'CANCELLED')

  return (
    <section>
      <div className='mb-3 flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-lg font-extrabold text-ink sm:text-xl'>Lịch hẹn hôm nay</h2>
          <p className='mt-1 text-sm text-muted'>Khách đã đặt lịch theo từng mốc giờ và khu vực.</p>
        </div>
        <span className='rounded-full bg-white px-3 py-1.5 text-xs font-bold text-muted shadow-sm'>
          {loading ? '–' : active.length} lịch đặt trong ngày
        </span>
      </div>

      {error ? (
        <div className={`${portalCardClass} flex flex-wrap items-center justify-between gap-3 p-5 text-sm text-red-700`}>
          <span>{error}</span>
          <button type='button' className='font-bold text-clinic' onClick={onRetry}>
            Thử lại
          </button>
        </div>
      ) : !loading && items.length === 0 ? (
        <div className={`${portalCardClass} flex flex-col items-center gap-2 px-6 py-10 text-center`}>
          <Icon name='event_available' size={32} className='text-clinic/60' />
          <p className='text-sm text-muted'>Hôm nay chưa có lịch hẹn nào.</p>
        </div>
      ) : (
        <ul className='space-y-3'>
          {items.map((appointment, index) => {
            const meta = appointmentStatusMeta[appointment.status]
            const closed = appointment.status === 'CANCELLED'
            return (
              <motion.li
                key={appointment.appointmentID}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : Math.min(index, 6) * 0.05, ease: 'easeOut' }}
              >
                <article
                  className={`${portalCardClass} flex flex-wrap items-start justify-between gap-4 p-5 ${
                    closed ? 'opacity-70' : ''
                  }`}
                >
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <span className='rounded-full bg-canvas px-3 py-1 text-sm font-extrabold text-ink'>
                        {appointment.appointmentTime}
                      </span>
                      <h3 className='text-base font-extrabold text-ink'>{appointment.customerName}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.className}`}
                      >
                        <Icon name={meta.icon} size={13} />
                        {meta.label}
                      </span>
                    </div>
                    <p className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink/80'>
                      <span className='inline-flex items-center gap-1.5'>
                        <Icon name='call' size={15} className='text-clinic' />
                        {formatPhone(appointment.phoneNumber)}
                      </span>
                      <span className='inline-flex items-center gap-1.5'>
                        <Icon name='location_on' size={15} className='text-clinic' />
                        {appointment.branch.nameVietnamese}
                      </span>
                    </p>
                    {appointment.customerNote ? (
                      <p className='mt-1.5 text-xs leading-5 text-muted'>“{appointment.customerNote}”</p>
                    ) : null}
                  </div>

                  {closed ? null : (
                    <div className='flex flex-col items-end gap-2'>
                      {nextServiceStep[appointment.status] ? (
                        <button
                          type='button'
                          disabled={busyID === appointment.appointmentID}
                          className='rounded-full bg-clinic px-4 py-2 text-xs font-bold whitespace-nowrap text-white transition hover:bg-clinic-deep disabled:opacity-60'
                          onClick={() => onConfirm(appointment)}
                        >
                          Xác nhận lịch
                        </button>
                      ) : null}
                      <Link
                        to={`/portal/manager/customer-services?phone=${encodeURIComponent(appointment.phoneNumber)}`}
                        className='text-xs font-semibold text-muted transition hover:text-clinic'
                      >
                        Ghi dịch vụ
                      </Link>
                    </div>
                  )}
                </article>
              </motion.li>
            )
          })}
        </ul>
      )}

      <Link
        to='/portal/manager/appointments'
        className='mt-3 inline-flex items-center gap-1 px-1 text-sm font-semibold text-clinic'
      >
        Xem toàn bộ lịch hẹn
        <Icon name='arrow_forward' size={16} />
      </Link>
    </section>
  )
}
