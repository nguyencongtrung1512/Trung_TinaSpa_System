import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import type { AppointmentStatus } from '~/lib/booking'
import { initials, smallOutline, smallSolid } from '~/portal/appointments/AppointmentList'
import {
  appointmentStatusMeta,
  formatClock,
  formatPhone,
  nextServiceStep,
  type Appointment
} from '~/portal/appointments/appointments.api'
import { portalCardClass } from '~/portal/styles'

export const serviceStatuses: readonly AppointmentStatus[] = ['CONFIRMED']

const filters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'CONFIRMED', label: 'Đã xác nhận' }
] as const

type Filter = (typeof filters)[number]['id']

export function visitTag(appointment: Appointment) {
  const visits = appointment.completedVisits
  return visits > 0
    ? { label: `Khách quen · ${visits} lần`, className: 'bg-mist text-clinic' }
    : { label: 'Khách mới', className: 'bg-canvas text-muted' }
}

export function statusTime(appointment: Appointment) {
  if (appointment.status === 'CONFIRMED') {
    return appointment.confirmedBy ? `Đã gọi xác nhận · ${appointment.confirmedBy.fullName}` : 'Đã xác nhận'
  }
  return null
}

export interface ServiceBoardProps {
  readonly items: readonly Appointment[]
  readonly loading: boolean
  readonly selectedID: string | null
  readonly busyID: string | null
  readonly pendingCount: number
  readonly onSelect: (id: string) => void
  readonly onAdvance: (appointment: Appointment, status: AppointmentStatus) => void
}

export function ServiceBoard({
  items,
  loading,
  selectedID,
  busyID,
  pendingCount,
  onSelect,
  onAdvance
}: ServiceBoardProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const visible = items.filter((item) => filter === 'all' || item.status === filter)
  const activeFilter = filters.find((item) => item.id === filter)
  const remaining = items.length

  useEffect(() => {
    if (visible.length > 0 && !visible.some((item) => item.appointmentID === selectedID)) {
      onSelect(visible[0].appointmentID)
    }
  }, [visible, selectedID, onSelect])

  useEffect(() => {
    if (!menuOpen) return
    function close(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menuOpen])

  return (
    <section aria-labelledby='service-board-title'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h2 id='service-board-title' className='flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg'>
          <span className='size-2 rounded-full bg-clinic' />
          Danh sách phục vụ hôm nay
          <span className='text-sm font-medium text-muted'>{loading ? '…' : `${items.length} lịch hẹn`}</span>
        </h2>
        <div className='relative' ref={menuRef}>
          <button
            type='button'
            className='inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-clinic'
            aria-expanded={menuOpen}
            aria-haspopup='menu'
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name='filter_alt' size={18} />
            {filter === 'all' ? 'Lọc trạng thái' : activeFilter?.label}
          </button>
          <AnimatePresence>
            {menuOpen ? (
              <motion.ul
                role='menu'
                className='absolute right-0 z-10 mt-1 w-48 rounded-2xl border border-rose-soft/70 bg-white p-1.5 shadow-lg'
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
              >
                {filters.map((item) => (
                  <li key={item.id}>
                    <button
                      type='button'
                      role='menuitemradio'
                      aria-checked={filter === item.id}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                        filter === item.id ? 'bg-mist text-clinic' : 'text-ink hover:bg-canvas'
                      }`}
                      onClick={() => {
                        setFilter(item.id)
                        setMenuOpen(false)
                      }}
                    >
                      {item.label}
                      <span className='text-xs text-muted'>
                        {item.id === 'all' ? items.length : items.filter((entry) => entry.status === item.id).length}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className='space-y-3' aria-live='polite'>
        {loading ? (
          [0, 1, 2].map((row) => <div key={row} className={`${portalCardClass} h-32 animate-pulse`} />)
        ) : (
          <AnimatePresence mode='popLayout'>
            {visible.map((appointment, index) => (
              <ServiceCard
                key={appointment.appointmentID}
                appointment={appointment}
                index={index}
                selected={appointment.appointmentID === selectedID}
                busy={busyID === appointment.appointmentID}
                onSelect={onSelect}
                onAdvance={onAdvance}
              />
            ))}
          </AnimatePresence>
        )}
        {!loading && visible.length === 0 ? (
          <div className={`${portalCardClass} flex flex-col items-center gap-2 px-5 py-10 text-center`}>
            <Icon name='event_available' size={30} className='text-clinic/60' />
            <p className='text-sm text-muted'>
              {items.length === 0
                ? 'Chưa có khách nào được xác nhận cho hôm nay.'
                : 'Không có lịch nào ở trạng thái này.'}
            </p>
          </div>
        ) : null}
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-muted'>
        <p>
          {loading
            ? ' '
            : `Còn ${remaining} khách chưa hoàn thành${pendingCount > 0 ? ` · ${pendingCount} lịch đang chờ xác nhận` : ''}`}
        </p>
        <Link to='/portal/staff/appointments' className='font-semibold text-clinic'>
          Xem toàn bộ ngày →
        </Link>
      </div>
    </section>
  )
}

function ServiceCard({
  appointment,
  index,
  selected,
  busy,
  onSelect,
  onAdvance
}: {
  readonly appointment: Appointment
  readonly index: number
  readonly selected: boolean
  readonly busy: boolean
  readonly onSelect: (id: string) => void
  readonly onAdvance: (appointment: Appointment, status: AppointmentStatus) => void
}) {
  const reduceMotion = useReducedMotion()
  const meta = appointmentStatusMeta[appointment.status]
  const next = nextServiceStep[appointment.status]
  const tag = visitTag(appointment)
  const detail = statusTime(appointment)

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : Math.min(index, 6) * 0.05, ease: 'easeOut' }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      role='button'
      tabIndex={0}
      aria-pressed={selected}
      className={`${portalCardClass} cursor-pointer p-4 text-left sm:p-5 ${selected ? 'ring-2 ring-clinic/25' : ''}`}
      onClick={() => onSelect(appointment.appointmentID)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(appointment.appointmentID)
        }
      }}
    >
      <div className='flex flex-wrap items-start gap-3'>
        <p className='w-14 shrink-0 text-lg font-extrabold text-ink'>{appointment.appointmentTime}</p>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <h3 className='text-base font-extrabold text-ink'>{appointment.customerName}</h3>
            <span className='text-xs text-muted'>{formatPhone(appointment.phoneNumber)}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tag.className}`}>{tag.label}</span>
          </div>
          <div className='mt-3 flex gap-3'>
            <span className='grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f8d5e3] to-[#f3a8c4] text-xs font-bold text-clinic-deep'>
              {initials(appointment.customerName)}
            </span>
            <div className='min-w-0 flex-1'>
              <p className='flex items-center gap-1.5 text-sm text-ink'>
                <Icon name='location_on' size={15} className='text-clinic' />
                {appointment.branch.nameVietnamese}
              </p>
              {appointment.customerNote ? (
                <p className='mt-1 line-clamp-2 text-xs leading-5 text-muted'>“{appointment.customerNote}”</p>
              ) : null}
              <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
                >
                  <Icon name={meta.icon} size={14} />
                  {meta.label}
                  {detail ? <span className='font-normal opacity-80'>· {detail}</span> : null}
                </span>
                <div className='flex items-center gap-1.5'>
                  {appointment.status === 'CONFIRMED' ? (
                    <a
                      href={`tel:${appointment.phoneNumber}`}
                      className={smallOutline}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Icon name='call' size={15} />
                      Gọi khách
                    </a>
                  ) : null}
                  {next ? (
                    <button
                      type='button'
                      className={smallSolid}
                      disabled={busy}
                      onClick={(event) => {
                        event.stopPropagation()
                        onAdvance(appointment, next.status)
                      }}
                    >
                      <Icon name={next.icon} size={16} />
                      {busy ? 'Đang lưu...' : next.label}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
