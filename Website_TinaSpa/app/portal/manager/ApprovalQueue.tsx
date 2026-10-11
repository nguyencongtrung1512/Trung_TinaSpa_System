import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatDateVi, formatPhone, type Appointment } from '~/portal/appointments/appointments.api'
import { portalCardClass } from '~/portal/styles'

const VISIBLE = 4

export interface ApprovalQueueProps {
  readonly items: readonly Appointment[]
  readonly loading: boolean
  readonly error?: string
  readonly busyID: string | null
  readonly onConfirm: (appointment: Appointment) => void
}

export function ApprovalQueue({ items, loading, error, busyID, onConfirm }: ApprovalQueueProps) {
  const reduceMotion = useReducedMotion()
  const shown = items.slice(0, VISIBLE)
  const hidden = items.length - shown.length

  return (
    <section>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <h2 className='text-lg font-extrabold text-ink sm:text-xl'>Cần xác nhận</h2>
        <motion.span
          key={items.length}
          initial={reduceMotion ? false : { scale: 1.25 }}
          animate={{ scale: 1 }}
          className='rounded-full bg-clinic px-3 py-1 text-xs font-bold text-white'
        >
          {loading ? '–' : String(items.length).padStart(2, '0')} lịch
        </motion.span>
      </div>

      {error ? (
        <p className={`${portalCardClass} p-5 text-sm text-red-700`}>{error}</p>
      ) : !loading && items.length === 0 ? (
        <div className={`${portalCardClass} flex flex-col items-center gap-2 px-6 py-8 text-center`}>
          <Icon name='task_alt' size={30} className='text-emerald-500' />
          <p className='text-sm text-muted'>Không có lịch nào đang chờ xác nhận.</p>
        </div>
      ) : (
        <ul className='space-y-3'>
          {shown.map((appointment) => (
            <li key={appointment.appointmentID}>
              <article className={`${portalCardClass} p-5`}>
                <div className='flex items-center justify-between gap-3'>
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700'>
                    <Icon name='language' size={14} />
                    Đặt từ website
                  </span>
                  <span className='text-xs text-muted'>
                    {appointment.appointmentTime} · {formatDateVi(appointment.appointmentDate)}
                  </span>
                </div>
                <h3 className='mt-3 text-base leading-6 font-extrabold text-ink'>{appointment.customerName}</h3>
                <p className='mt-1 text-sm leading-6 text-muted'>
                  {formatPhone(appointment.phoneNumber)} · {appointment.branch.nameVietnamese}
                </p>
                <button
                  type='button'
                  disabled={busyID === appointment.appointmentID}
                  className='mt-4 w-full rounded-full bg-clinic py-2.5 text-sm font-bold text-white transition hover:bg-clinic-deep disabled:opacity-60'
                  onClick={() => onConfirm(appointment)}
                >
                  {busyID === appointment.appointmentID ? 'Đang xác nhận...' : 'Xác nhận lịch'}
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 ? (
        <Link
          to='/portal/manager/appointments'
          className='mt-3 inline-flex items-center gap-1 px-1 text-sm font-semibold text-clinic'
        >
          Còn {hidden} lịch khác
          <Icon name='arrow_forward' size={16} />
        </Link>
      ) : null}
    </section>
  )
}
