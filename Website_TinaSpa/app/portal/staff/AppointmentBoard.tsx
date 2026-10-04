import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router'
import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import {
  appointmentFilters,
  deskAppointmentTotal,
  deskAppointments,
  type AppointmentFilter,
  type DeskAppointment
} from '~/portal/staff/staff-desk.data'

const statusClass = {
  progress: 'bg-emerald-50 text-emerald-700',
  wait: 'bg-amber-50 text-amber-700',
  muted: 'bg-canvas text-muted',
  alert: 'bg-orange-50 text-orange-600'
} as const

export interface AppointmentBoardProps {
  readonly selectedId: string
  readonly onSelect: (id: string) => void
}

export function AppointmentBoard({ selectedId, onSelect }: AppointmentBoardProps) {
  const [filter, setFilter] = useState<AppointmentFilter>('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const visible = deskAppointments.filter((item) => filter === 'all' || item.tone === filter)
  const activeFilter = appointmentFilters.find((item) => item.id === filter)

  useEffect(() => {
    const next = deskAppointments.filter((item) => filter === 'all' || item.tone === filter)
    if (next.length > 0 && !next.some((item) => item.id === selectedId)) {
      onSelect(next[0].id)
    }
  }, [filter, onSelect, selectedId])

  useEffect(() => {
    if (!menuOpen) return
    function close(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menuOpen])

  return (
    <section>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h2 className='flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg'>
          <span className='size-2 rounded-full bg-clinic' />
          Danh sách phục vụ hôm nay
          <span className='text-sm font-medium text-muted'>{deskAppointmentTotal} lịch hẹn</span>
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
                {appointmentFilters.map((item) => (
                  <li key={item.id}>
                    <button
                      type='button'
                      role='menuitemradio'
                      aria-checked={filter === item.id}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                        filter === item.id ? 'bg-mist text-clinic' : 'text-ink hover:bg-canvas'
                      }`}
                      onClick={() => {
                        setFilter(item.id)
                        setMenuOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className='space-y-3' aria-live='polite'>
        <AnimatePresence mode='popLayout'>
          {visible.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              selected={appointment.id === selectedId}
              index={index}
              onSelect={onSelect}
            />
          ))}
        </AnimatePresence>
        {visible.length === 0 ? (
          <p className={`${portalCardClass} px-5 py-8 text-sm text-muted`}>Không có lịch nào ở trạng thái này.</p>
        ) : null}
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-muted'>
        <p>Còn 4 lịch hẹn khác vào khung giờ chiều & tối (18:00 - 20:30)</p>
        <Link to='/portal/staff/lich-hen' className='font-semibold text-clinic'>
          Xem toàn bộ ngày →
        </Link>
      </div>
    </section>
  )
}

function AppointmentCard({
  appointment,
  selected,
  index,
  onSelect
}: {
  readonly appointment: DeskAppointment
  readonly selected: boolean
  readonly index: number
  readonly onSelect: (id: string) => void
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05, ease: 'easeOut' }}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      role='button'
      tabIndex={0}
      aria-pressed={selected}
      className={`${portalCardClass} cursor-pointer p-4 text-left sm:p-5 ${selected ? 'ring-2 ring-clinic/25' : ''}`}
      onClick={() => onSelect(appointment.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(appointment.id)
        }
      }}
    >
      <div className='flex flex-wrap items-start gap-3'>
        <p className='w-14 shrink-0 text-lg font-extrabold text-ink'>{appointment.time}</p>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <h3 className='text-base font-extrabold text-ink'>{appointment.name}</h3>
            <span className='text-xs text-muted'>{appointment.duration}</span>
            <span className='text-xs text-muted'>{appointment.phone}</span>
            {appointment.tag ? (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  appointment.tagTone === 'vip' ? 'bg-mist text-clinic' : 'bg-canvas text-muted'
                }`}
              >
                {appointment.tag}
              </span>
            ) : null}
          </div>
          <div className='mt-3 flex gap-3'>
            <span className='grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f8d5e3] to-[#f3a8c4] text-xs font-bold text-clinic-deep'>
              {appointment.initials}
            </span>
            <div className='min-w-0 flex-1'>
              <p className='text-sm text-ink'>
                <span className='font-bold'>{appointment.kind}: </span>
                {appointment.detail}
              </p>
              {appointment.stage ? <p className='mt-1 text-xs leading-5 text-muted'>{appointment.stage}</p> : null}
              <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClass[appointment.statusTone]}`}
                >
                  <Icon name='check_circle' size={14} />
                  {appointment.status}
                </span>
                <ActionLabel appointment={appointment} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function ActionLabel({ appointment }: { readonly appointment: DeskAppointment }) {
  if (appointment.actionTone === 'solid') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-clinic px-4 py-2 text-xs font-bold tracking-wide text-white uppercase'>
        <Icon name='play_arrow' size={16} />
        {appointment.action}
      </span>
    )
  }
  if (appointment.actionTone === 'text') {
    return <span className='text-sm font-semibold text-muted'>{appointment.action}</span>
  }
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-rose-soft px-4 py-2 text-sm font-semibold text-ink'>
      <Icon name={appointment.tone === 'call' ? 'call' : 'how_to_reg'} size={16} />
      {appointment.action}
    </span>
  )
}
