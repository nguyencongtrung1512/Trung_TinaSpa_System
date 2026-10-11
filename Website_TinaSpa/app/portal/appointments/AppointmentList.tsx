import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { useSession } from '~/lib/auth'
import type { Branch } from '~/lib/booking'
import { portalRoleFromSession } from '~/portal/access'
import { portalCardClass } from '~/portal/styles'
import {
  appointmentStatusMeta,
  canReschedule,
  formatDateVi,
  formatPhone,
  nextServiceStep,
  type Appointment
} from './appointments.api'
import { useAppointmentActions } from './useAppointmentActions'

export const smallSolid =
  'inline-flex items-center gap-1.5 rounded-full bg-clinic px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-clinic-deep disabled:opacity-60'
export const smallOutline =
  'inline-flex items-center gap-1.5 rounded-full border border-rose-soft bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-clinic hover:text-clinic disabled:opacity-60'
export const smallText =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted transition hover:text-clinic disabled:opacity-60'

export function initials(name: string) {
  const words = name.trim().split(/\s+/)
  return (words.length > 1 ? `${words[0][0]}${words.at(-1)?.[0] ?? ''}` : words[0].slice(0, 2)).toUpperCase()
}

export function AppointmentList({
  items,
  branches,
  showDate = false,
  emptyText,
  onChanged
}: {
  readonly items: readonly Appointment[]
  readonly branches: readonly Branch[]
  readonly showDate?: boolean
  readonly emptyText: string
  readonly onChanged: (appointment: Appointment) => void
}) {
  const reduceMotion = useReducedMotion()
  const actions = useAppointmentActions(branches, onChanged)
  const serviceRole = portalRoleFromSession(useSession())

  return (
    <>
      {items.length === 0 ? (
        <div className={`${portalCardClass} flex flex-col items-center gap-2 px-6 py-10 text-center`}>
          <Icon name='event_available' size={32} className='text-clinic/60' />
          <p className='text-sm text-muted'>{emptyText}</p>
        </div>
      ) : (
        <ul className='space-y-3' aria-live='polite'>
          <AnimatePresence initial={false}>
            {items.map((appointment, index) => {
              const meta = appointmentStatusMeta[appointment.status]
              const next = nextServiceStep[appointment.status]
              const busy = actions.busyID === appointment.appointmentID
              const closed = appointment.status === 'CANCELLED'
              return (
                <motion.li
                  key={appointment.appointmentID}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : Math.min(index, 6) * 0.04 }}
                  className={`${portalCardClass} p-4 sm:p-5 ${closed ? 'opacity-70' : ''}`}
                >
                  <div className='flex flex-wrap items-start gap-3 sm:gap-4'>
                    <div className='w-16 shrink-0'>
                      <p className='text-lg font-extrabold text-ink'>{appointment.appointmentTime}</p>
                      {showDate ? (
                        <p className='text-[11px] font-semibold text-muted'>
                          {formatDateVi(appointment.appointmentDate)}
                        </p>
                      ) : null}
                    </div>
                    <span className='grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f8d5e3] to-[#f3a8c4] text-xs font-bold text-clinic-deep'>
                      {initials(appointment.customerName)}
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                        <h3 className='text-base font-extrabold text-ink'>{appointment.customerName}</h3>
                        <a
                          href={`tel:${appointment.phoneNumber}`}
                          className='inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-clinic'
                        >
                          <Icon name='call' size={14} />
                          {formatPhone(appointment.phoneNumber)}
                        </a>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.className}`}
                        >
                          <Icon name={meta.icon} size={13} />
                          {meta.label}
                        </span>
                      </div>
                      <p className='mt-1.5 flex items-center gap-1.5 text-sm text-ink/80'>
                        <Icon name='location_on' size={15} className='text-clinic' />
                        {appointment.branch.nameVietnamese}
                      </p>
                      {appointment.customerNote ? (
                        <p className='mt-1 text-xs leading-5 text-muted'>“{appointment.customerNote}”</p>
                      ) : null}
                      {appointment.note ? (
                        <p className='mt-1 text-xs leading-5 text-ink/70'>
                          <span className='font-bold'>Nội bộ: </span>
                          {appointment.note}
                        </p>
                      ) : null}
                      {appointment.confirmedBy ? (
                        <p className='mt-1 text-[11px] text-muted'>Xác nhận bởi {appointment.confirmedBy.fullName}</p>
                      ) : null}
                      <p className='mt-1 text-[11px] text-muted'>Mã {appointment.appointmentID}</p>
                    </div>
                    <div className='flex w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:flex-col sm:items-end'>
                      {next ? (
                        <button
                          type='button'
                          className={smallSolid}
                          disabled={busy}
                          onClick={() => void actions.setStatus(appointment, next.status)}
                        >
                          <Icon name={next.icon} size={16} />
                          {busy ? 'Đang lưu...' : next.label}
                        </button>
                      ) : null}
                      {canReschedule(appointment) ? (
                        <button
                          type='button'
                          className={smallOutline}
                          disabled={busy}
                          onClick={() => actions.edit(appointment)}
                        >
                          <Icon name='edit_calendar' size={16} />
                          Sửa thời gian
                        </button>
                      ) : null}
                      {!closed ? (
                        <button
                          type='button'
                          className={smallText}
                          disabled={busy}
                          onClick={() => actions.cancel(appointment)}
                        >
                          <Icon name='close' size={15} />
                          Hủy lịch
                        </button>
                      ) : null}
                      {!closed && serviceRole ? (
                        <Link
                          to={`/portal/${serviceRole}/customer-services?phone=${encodeURIComponent(appointment.phoneNumber)}`}
                          className={smallOutline}
                        >
                          <Icon name='receipt_long' size={16} />
                          Ghi dịch vụ
                        </Link>
                      ) : null}
                      {appointment.status === 'CANCELLED' ? (
                        <button
                          type='button'
                          className={smallOutline}
                          disabled={busy}
                          onClick={() => void actions.setStatus(appointment, 'PENDING')}
                        >
                          <Icon name='undo' size={16} />
                          Mở lại
                        </button>
                      ) : null}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
      {actions.elements}
    </>
  )
}
