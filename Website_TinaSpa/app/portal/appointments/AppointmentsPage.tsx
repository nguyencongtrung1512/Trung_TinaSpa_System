import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { localDateIso, type AppointmentStatus } from '~/lib/booking'
import { formatPortalDate } from '~/portal/format'
import { inputClass, outlineButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import type { PortalRole } from '~/portal/types'
import { appointmentStatusMeta } from './appointments.api'
import { AppointmentList } from './AppointmentList'
import { useAppointments, useBranches } from './useAppointments'
import { Select } from '~/components/ui/Select'

function shiftDate(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  return localDateIso(new Date(year, month - 1, day + days))
}

function parseIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const statuses = Object.keys(appointmentStatusMeta) as AppointmentStatus[]

export function AppointmentsPage({ role }: { readonly role: PortalRole }) {
  const reduceMotion = useReducedMotion()
  const today = localDateIso()
  const [date, setDate] = useState(today)
  const [branchID, setBranchID] = useState('')
  const [status, setStatus] = useState<AppointmentStatus | ''>('')
  const branches = useBranches()
  const { items, loading, error, refresh, replace } = useAppointments({
    date: date || undefined,
    branchID: branchID || undefined,
    status: status || undefined
  })

  const counts = statuses.map((key) => ({ key, value: items.filter((item) => item.status === key).length }))

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header>
        <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
          <span>{portalRoleLabel[role]}</span>
          <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
        </div>
      </header>

      <div className={`${portalCardClass} mt-6 p-4`}>
        <div className='flex flex-wrap items-center gap-2'>
          {/* Nhóm điều hướng ngày — luôn nằm cùng một dòng */}
          <div className='flex shrink-0 items-center gap-1'>
            <button
              type='button'
              aria-label='Ngày trước'
              className='inline-flex size-9 items-center justify-center rounded-full border border-rose-soft text-ink hover:border-clinic hover:text-clinic'
              onClick={() => setDate((current) => shiftDate(current || today, -1))}
            >
              <Icon name='chevron_left' size={20} />
            </button>
            <input
              type='date'
              aria-label='Chọn ngày'
              className={`${inputClass} w-44`}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
            <button
              type='button'
              aria-label='Ngày sau'
              className='inline-flex size-9 items-center justify-center rounded-full border border-rose-soft text-ink hover:border-clinic hover:text-clinic'
              onClick={() => setDate((current) => shiftDate(current || today, 1))}
            >
              <Icon name='chevron_right' size={20} />
            </button>
          </div>

          {/* Nút chọn nhanh */}
          <button
            type='button'
            className={`${outlineButtonClass} min-h-9 px-4 py-1.5 ${date === today ? 'border-clinic bg-mist font-bold text-clinic' : ''}`}
            onClick={() => setDate(today)}
          >
            Hôm nay
          </button>
          <button
            type='button'
            className={`${outlineButtonClass} min-h-9 px-4 py-1.5 ${!date ? 'border-clinic bg-mist font-bold text-clinic' : ''}`}
            onClick={() => setDate('')}
          >
            Tất cả ngày
          </button>

          {/* Đẩy dropdowns sang phải */}
          <div className='flex-1' />

          {/* Bộ lọc khu vực & trạng thái */}
          <div className='flex flex-wrap gap-2'>
            <Select
              aria-label='Lọc khu vực'
              className='w-full min-w-[10rem] sm:w-56'
              value={branchID}
              onChange={setBranchID}
              options={[
                { value: '', label: 'Mọi khu vực' },
                ...branches.map((item) => ({ value: item.branchID, label: item.nameVietnamese }))
              ]}
            />
            <Select
              aria-label='Lọc trạng thái'
              className='w-full min-w-[9rem] sm:w-44'
              value={status}
              onChange={setStatus}
              options={[
                { value: '' as const, label: 'Mọi trạng thái' },
                ...statuses.map((key) => ({ value: key, label: appointmentStatusMeta[key].label }))
              ]}
            />
          </div>
        </div>
      </div>

      <ul className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        {counts.map(({ key, value }) => {
          const isSelected = status === key
          return (
            <li
              key={key}
              role='button'
              tabIndex={0}
              onClick={() => setStatus((cur) => (cur === key ? '' : key))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setStatus((cur) => (cur === key ? '' : key))
              }}
              className={`${portalCardClass} flex cursor-pointer items-center gap-3 p-4 transition hover:border-clinic ${
                isSelected ? 'ring-2 ring-clinic bg-mist/50' : ''
              }`}
            >
              <span className={`grid size-10 place-items-center rounded-2xl ${appointmentStatusMeta[key].className}`}>
                <Icon name={appointmentStatusMeta[key].icon} size={20} />
              </span>
              <div>
                <p className='text-[11px] font-bold tracking-wide text-muted uppercase'>
                  {appointmentStatusMeta[key].label}
                </p>
                <p className='text-2xl font-extrabold text-ink'>{loading ? '–' : value}</p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className='mt-5'>
        {error ? (
          <div className={`${portalCardClass} flex flex-col items-center gap-3 px-6 py-10 text-center`}>
            <Icon name='cloud_off' size={32} className='text-clinic' />
            <p className='text-sm text-ink'>{error}</p>
            <button type='button' className={outlineButtonClass} onClick={() => void refresh()}>
              <Icon name='refresh' size={18} />
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className='space-y-3'>
            {[0, 1, 2].map((row) => (
              <div key={row} className={`${portalCardClass} h-24 animate-pulse`} />
            ))}
          </div>
        ) : (
          <AppointmentList
            items={items}
            branches={branches}
            showDate={!date || date !== today}
            emptyText={
              branchID || status
                ? 'Không có lịch hẹn khớp bộ lọc.'
                : date === today
                  ? 'Chưa có lịch hẹn nào hôm nay.'
                  : date
                    ? 'Chưa có lịch hẹn nào trong ngày đã chọn.'
                    : 'Chưa có lịch hẹn nào.'
            }
            onChanged={(next) => {
              replace(next)
              void refresh()
            }}
          />
        )}
      </div>
    </motion.div>
  )
}
