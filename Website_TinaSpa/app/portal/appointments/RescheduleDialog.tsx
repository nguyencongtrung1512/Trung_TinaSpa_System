import { useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { localDateIso, type Branch } from '~/lib/booking'
import {
  Field,
  FormError,
  PortalDialog,
  inputClass,
  outlineButtonClass,
  primaryButtonClass
} from '~/portal/manager/services/form-ui'
import { appointmentsApi, formatPhone, type Appointment } from './appointments.api'

export function RescheduleDialog({
  appointment,
  branches,
  onClose,
  onSaved
}: {
  readonly appointment: Appointment | null
  readonly branches: readonly Branch[]
  readonly onClose: () => void
  readonly onSaved: (appointment: Appointment) => void
}) {
  return (
    <PortalDialog
      open={appointment !== null}
      title='Chỉnh sửa lịch hẹn'
      description={appointment ? `${appointment.customerName} · ${formatPhone(appointment.phoneNumber)}` : undefined}
      size='md'
      onClose={onClose}
    >
      {appointment ? (
        <RescheduleForm
          key={appointment.appointmentID}
          appointment={appointment}
          branches={branches}
          onClose={onClose}
          onSaved={onSaved}
        />
      ) : null}
    </PortalDialog>
  )
}

function RescheduleForm({
  appointment,
  branches,
  onClose,
  onSaved
}: {
  readonly appointment: Appointment
  readonly branches: readonly Branch[]
  readonly onClose: () => void
  readonly onSaved: (appointment: Appointment) => void
}) {
  const [branchID, setBranchID] = useState(appointment.branch.branchID)
  const [date, setDate] = useState(appointment.appointmentDate)
  const [time, setTime] = useState(appointment.appointmentTime)
  const [note, setNote] = useState(appointment.note ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  const branchOptions = branches.some((item) => item.branchID === appointment.branch.branchID)
    ? branches
    : [appointment.branch, ...branches]
  const branch = branchOptions.find((item) => item.branchID === branchID) ?? appointment.branch

  async function save() {
    if (!date || !time) {
      setError('Hãy chọn ngày và giờ hẹn.')
      return
    }
    if (time < branch.openTime || time >= branch.closeTime) {
      setError(`Giờ hẹn phải trong khoảng ${branch.openTime} – ${branch.closeTime}.`)
      return
    }
    setBusy(true)
    setError(undefined)
    try {
      onSaved(
        await appointmentsApi.update(appointment.appointmentID, {
          ...(branchID === appointment.branch.branchID ? {} : { branchID }),
          ...(date === appointment.appointmentDate ? {} : { appointmentDate: date }),
          ...(time === appointment.appointmentTime ? {} : { appointmentTime: time }),
          note: note.trim() || null
        })
      )
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Không lưu được lịch hẹn.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <FormError message={error} />
      <div className='grid gap-4'>
        <Field label='Khu vực' required>
          {(id) => (
            <select
              id={id}
              className={inputClass}
              value={branchID}
              onChange={(event) => setBranchID(event.target.value)}
            >
              {branchOptions.map((item) => (
                <option key={item.branchID} value={item.branchID}>
                  {item.nameVietnamese}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Field label='Ngày hẹn' required>
            {(id) => (
              <input
                id={id}
                type='date'
                className={inputClass}
                min={localDateIso()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            )}
          </Field>
          <Field label='Giờ hẹn' required hint={`Giờ nhận khách ${branch.openTime} – ${branch.closeTime}`}>
            {(id) => (
              <input
                id={id}
                type='time'
                step={300}
                className={inputClass}
                min={branch.openTime}
                max={branch.closeTime}
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            )}
          </Field>
        </div>
        {appointment.customerNote ? (
          <p className='rounded-2xl bg-mist px-4 py-3 text-sm text-ink/80'>
            <span className='font-bold'>Khách ghi chú: </span>
            {appointment.customerNote}
          </p>
        ) : null}
        <Field label='Ghi chú nội bộ'>
          {(id) => (
            <textarea
              id={id}
              rows={3}
              maxLength={1000}
              className={inputClass}
              placeholder='VD: Khách xin dời sang chiều, đã gọi xác nhận...'
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          )}
        </Field>
      </div>
      <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <button type='button' className={outlineButtonClass} onClick={onClose}>
          Hủy
        </button>
        <button type='button' className={primaryButtonClass} disabled={busy} onClick={() => void save()}>
          <Icon name='save' size={18} />
          {busy ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}
