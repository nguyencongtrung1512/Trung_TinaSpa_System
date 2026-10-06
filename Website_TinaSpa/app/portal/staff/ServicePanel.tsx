import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import type { AppointmentStatus } from '~/lib/booking'
import {
  appointmentStatusMeta,
  appointmentsApi,
  canReschedule,
  formatClock,
  formatPhone,
  nextServiceStep,
  type Appointment
} from '~/portal/appointments/appointments.api'
import { portalCardClass } from '~/portal/styles'
import { visitTag } from '~/portal/staff/ServiceBoard'

export interface ServicePanelProps {
  readonly appointment: Appointment | null
  readonly busy: boolean
  readonly onAdvance: (appointment: Appointment, status: AppointmentStatus) => void
  readonly onEdit: (appointment: Appointment) => void
  readonly onCancel: (appointment: Appointment) => void
  readonly onSaved: (appointment: Appointment) => void
}

export function ServicePanel({ appointment, ...props }: ServicePanelProps) {
  if (!appointment) {
    return (
      <div className={`${portalCardClass} flex flex-col items-center gap-2 px-5 py-12 text-center`}>
        <Icon name='spa' size={30} className='text-clinic/60' />
        <p className='text-sm text-muted'>Chọn một khách trong danh sách để xem chi tiết buổi chăm sóc.</p>
      </div>
    )
  }
  return <ServiceDetail key={appointment.appointmentID} appointment={appointment} {...props} />
}

function ServiceDetail({
  appointment,
  busy,
  onAdvance,
  onEdit,
  onCancel,
  onSaved
}: ServicePanelProps & { readonly appointment: Appointment }) {
  const reduceMotion = useReducedMotion()
  const toast = useToast()
  const [serviceNote, setServiceNote] = useState(appointment.serviceNote ?? '')
  const [saving, setSaving] = useState(false)
  const meta = appointmentStatusMeta[appointment.status]
  const next = nextServiceStep[appointment.status]
  const tag = visitTag(appointment)
  const dirty = serviceNote.trim() !== (appointment.serviceNote ?? '')

  const timeline = [
    { label: 'Đặt lịch qua website', at: appointment.createdAt, by: null },
    { label: 'Gọi xác nhận', at: appointment.confirmedAt, by: appointment.confirmedBy?.fullName },
    { label: 'Khách check-in', at: appointment.checkedInAt, by: null },
    { label: 'Bắt đầu chăm sóc', at: appointment.serviceStartedAt, by: appointment.servedBy?.fullName },
    { label: 'Hoàn thành', at: appointment.completedAt, by: null }
  ]

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    const toastID = toast.loading('Đang lưu ghi nhận...', appointment.customerName)
    try {
      const saved = await appointmentsApi.update(appointment.appointmentID, { serviceNote: serviceNote.trim() || null })
      onSaved(saved)
      toast.update(toastID, {
        type: 'success',
        title: 'Đã lưu ghi nhận sau buổi',
        message: appointment.customerName
      })
    } catch (saveError) {
      toast.update(toastID, {
        type: 'error',
        title: 'Không lưu được ghi nhận',
        message: saveError instanceof Error ? saveError.message : undefined
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.form
      onSubmit={(event) => void onSubmit(event)}
      className={`${portalCardClass} p-5`}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <h2 className='flex items-center gap-2 text-base font-extrabold text-ink'>
        <Icon name='spa' size={18} className='text-clinic' />
        Chi tiết buổi chăm sóc
      </h2>

      <div className='mt-4 flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-lg font-extrabold text-ink'>{appointment.customerName}</p>
          <a
            href={`tel:${appointment.phoneNumber}`}
            className='mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-clinic'
          >
            <Icon name='call' size={15} />
            {formatPhone(appointment.phoneNumber)}
          </a>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tag.className}`}>
          {tag.label}
        </span>
      </div>

      <dl className='mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-canvas p-3 text-sm'>
        <div>
          <dt className='text-[11px] font-bold tracking-wide text-muted uppercase'>Giờ hẹn</dt>
          <dd className='font-extrabold text-ink'>{appointment.appointmentTime}</dd>
        </div>
        <div>
          <dt className='text-[11px] font-bold tracking-wide text-muted uppercase'>Trạng thái</dt>
          <dd
            className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${meta.className}`}
          >
            <Icon name={meta.icon} size={13} />
            {meta.label}
          </dd>
        </div>
        <div className='col-span-2'>
          <dt className='text-[11px] font-bold tracking-wide text-muted uppercase'>Khu vực</dt>
          <dd className='font-semibold text-ink'>{appointment.branch.nameVietnamese}</dd>
        </div>
      </dl>

      {appointment.customerNote ? (
        <p className='mt-3 rounded-2xl bg-mist px-4 py-3 text-sm text-ink/80'>
          <span className='font-bold'>Khách ghi chú: </span>
          {appointment.customerNote}
        </p>
      ) : null}
      {appointment.note ? (
        <p className='mt-2 text-xs leading-5 text-ink/70'>
          <span className='font-bold'>Ghi chú nội bộ: </span>
          {appointment.note}
        </p>
      ) : null}

      <p className='mt-5 text-[11px] font-bold tracking-[0.14em] text-muted uppercase'>Tiến trình</p>
      <ol className='mt-2 space-y-2.5'>
        {timeline.map((step) => (
          <li key={step.label} className='flex items-start gap-3 text-sm'>
            <span
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
                step.at ? 'bg-clinic text-white' : 'border border-rose-soft bg-white text-transparent'
              }`}
            >
              <Icon name='check' size={13} />
            </span>
            <span className={step.at ? 'text-ink' : 'text-muted'}>
              <span className='font-semibold'>{step.label}</span>
              {step.at ? (
                <span className='text-muted'>
                  {' '}
                  · {formatClock(step.at)}
                  {step.by ? ` · ${step.by}` : ''}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {next || canReschedule(appointment) ? (
        <div className='mt-5 flex flex-wrap gap-2'>
          {next ? (
            <button
              type='button'
              disabled={busy}
              onClick={() => onAdvance(appointment, next.status)}
              className='inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-clinic px-4 py-3 text-xs font-bold tracking-wide text-white uppercase shadow-[0_12px_24px_rgba(225,29,116,0.28)] transition hover:bg-clinic-deep disabled:opacity-60'
            >
              <Icon name={next.icon} size={18} />
              {busy ? 'Đang lưu...' : next.label}
            </button>
          ) : null}
          {canReschedule(appointment) ? (
            <button
              type='button'
              onClick={() => onEdit(appointment)}
              className='inline-flex items-center gap-1.5 rounded-full border border-rose-soft px-4 py-3 text-xs font-semibold text-ink hover:border-clinic hover:text-clinic'
            >
              <Icon name='edit_calendar' size={16} />
              Sửa thời gian
            </button>
          ) : null}
        </div>
      ) : null}

      <label className='mt-5 block text-sm font-bold text-ink' htmlFor='service-note'>
        Ghi nhận & dặn dò sau buổi
      </label>
      <textarea
        id='service-note'
        value={serviceNote}
        maxLength={2000}
        onChange={(event) => setServiceNote(event.target.value)}
        rows={3}
        placeholder='VD: Da hơi kích ứng vùng má, dặn khách không dùng AHA/BHA trong 5 ngày, hẹn tái khám sau 2 tuần.'
        className='mt-2 w-full resize-none rounded-2xl border border-rose-soft/80 bg-canvas px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/80 focus:border-clinic'
      />
      <div className='mt-3 flex items-center justify-between gap-3'>
        {appointment.status !== 'CANCELLED' ? (
          <button
            type='button'
            className='text-xs font-semibold text-muted hover:text-clinic'
            onClick={() => onCancel(appointment)}
          >
            Hủy lịch
          </button>
        ) : (
          <span />
        )}
        <button
          type='submit'
          disabled={saving || !dirty}
          className='inline-flex items-center gap-1.5 rounded-full border border-clinic/40 px-4 py-2 text-xs font-bold text-clinic transition hover:bg-mist disabled:opacity-50'
        >
          <Icon name='save' size={16} />
          {saving ? 'Đang lưu...' : 'Lưu ghi nhận'}
        </button>
      </div>
    </motion.form>
  )
}
