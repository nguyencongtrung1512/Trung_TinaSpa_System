import { useCallback, useState } from 'react'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import type { AppointmentStatus, Branch } from '~/lib/booking'
import { PortalDialog, outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { appointmentsApi, formatDateVi, type Appointment } from './appointments.api'
import { RescheduleDialog } from './RescheduleDialog'

const statusToast: Record<AppointmentStatus, { readonly loading: string; readonly done: string }> = {
  PENDING: { loading: 'Đang mở lại lịch hẹn...', done: 'Đã mở lại lịch hẹn' },
  CONFIRMED: { loading: 'Đang xác nhận lịch hẹn...', done: 'Đã xác nhận lịch hẹn' },
  CANCELLED: { loading: 'Đang hủy lịch hẹn...', done: 'Đã hủy lịch hẹn' }
}

const describe = (appointment: Appointment) =>
  `${appointment.customerName} · ${appointment.appointmentTime} ngày ${formatDateVi(appointment.appointmentDate)}`

/** Status changes and reschedule/cancel dialogs with toast feedback; render `elements` once. */
export function useAppointmentActions(branches: readonly Branch[], onChanged: (appointment: Appointment) => void) {
  const toast = useToast()
  const [busyID, setBusyID] = useState<string | null>(null)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [cancelling, setCancelling] = useState<Appointment | null>(null)

  const setStatus = useCallback(
    async (appointment: Appointment, status: AppointmentStatus) => {
      setBusyID(appointment.appointmentID)
      const toastID = toast.loading(statusToast[status].loading, appointment.customerName)
      try {
        const next =
          status === 'CONFIRMED' && appointment.status === 'PENDING'
            ? await appointmentsApi.confirm(appointment.appointmentID)
            : await appointmentsApi.update(appointment.appointmentID, { status })
        onChanged(next)
        toast.update(toastID, { type: 'success', title: statusToast[status].done, message: describe(next) })
      } catch (error) {
        toast.update(toastID, {
          type: 'error',
          title: 'Không cập nhật được lịch hẹn',
          message: error instanceof Error ? error.message : undefined
        })
      } finally {
        setBusyID(null)
      }
    },
    [onChanged, toast]
  )

  const closeEdit = useCallback(() => setEditing(null), [])
  const closeCancel = useCallback(() => setCancelling(null), [])

  const elements = (
    <>
      <RescheduleDialog
        appointment={editing}
        branches={branches}
        onClose={closeEdit}
        onSaved={(next) => {
          setEditing(null)
          onChanged(next)
          toast.success('Đã cập nhật thời gian hẹn', `${describe(next)} · ${next.branch.nameVietnamese}`)
        }}
      />

      <PortalDialog
        open={cancelling !== null}
        title='Hủy lịch hẹn?'
        size='md'
        onClose={closeCancel}
        onSubmit={() => {
          if (cancelling) void setStatus(cancelling, 'CANCELLED')
          setCancelling(null)
        }}
        footer={
          <>
            <button type='button' className={outlineButtonClass} onClick={closeCancel}>
              Giữ lịch
            </button>
            <button type='submit' className={`${primaryButtonClass} bg-red-600 hover:bg-red-700`}>
              <Icon name='event_busy' size={18} />
              Hủy lịch
            </button>
          </>
        }
      >
        {cancelling ? (
          <p className='text-sm leading-6 text-ink/80'>
            Lịch của <strong>{cancelling.customerName}</strong> lúc <strong>{cancelling.appointmentTime}</strong> ngày{' '}
            {formatDateVi(cancelling.appointmentDate)} sẽ chuyển sang trạng thái đã hủy. Bạn có thể mở lại sau.
          </p>
        ) : null}
      </PortalDialog>
    </>
  )

  return { busyID, setStatus, edit: setEditing, cancel: setCancelling, elements }
}
