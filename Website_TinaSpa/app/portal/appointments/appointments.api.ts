import { apiRequest } from '~/lib/api'
import type { AppointmentStatus, Branch } from '~/lib/booking'

export interface StaffSummary {
  readonly userID: string
  readonly fullName: string
}

export interface Appointment {
  readonly appointmentID: string
  readonly customerName: string
  readonly phoneNumber: string
  readonly appointmentDate: string
  readonly appointmentTime: string
  readonly customerNote: string | null
  readonly status: AppointmentStatus
  readonly branch: Branch
  readonly confirmedAt: string | null
  readonly confirmedBy: StaffSummary | null
  readonly checkedInAt: string | null
  readonly serviceStartedAt: string | null
  readonly completedAt: string | null
  readonly servedBy: StaffSummary | null
  readonly serviceNote: string | null
  readonly completedVisits: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly note: string | null
}

export interface AppointmentQuery {
  readonly date?: string
  readonly branchID?: string
  readonly status?: AppointmentStatus
}

export interface AppointmentUpdate {
  readonly branchID?: string
  readonly appointmentDate?: string
  readonly appointmentTime?: string
  readonly status?: AppointmentStatus
  readonly note?: string | null
  readonly serviceNote?: string | null
}

export const appointmentStatusMeta: Record<
  AppointmentStatus,
  { readonly label: string; readonly icon: string; readonly className: string }
> = {
  PENDING: { label: 'Chờ xác nhận', icon: 'schedule', className: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', icon: 'check_circle', className: 'bg-mist text-clinic' },
  CANCELLED: { label: 'Đã hủy', icon: 'cancel', className: 'bg-canvas text-muted' }
}

/** Next step of the service flow for each status. */
export const nextServiceStep: Partial<
  Record<AppointmentStatus, { readonly status: AppointmentStatus; readonly label: string; readonly icon: string }>
> = {
  PENDING: { status: 'CONFIRMED', label: 'Xác nhận', icon: 'how_to_reg' }
}

export function canReschedule(appointment: Appointment) {
  return appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'
}

export function formatClock(iso: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export const appointmentsApi = {
  list: (query: AppointmentQuery = {}) => {
    const params = new URLSearchParams(
      Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1]))
    )
    const search = params.toString()
    return apiRequest<Appointment[]>(`/appointments${search ? `?${search}` : ''}`, { auth: true })
  },
  update: (id: string, body: AppointmentUpdate) =>
    apiRequest<Appointment>(`/appointments/${id}`, { method: 'PATCH', body, auth: true }),
  confirm: (id: string) => apiRequest<Appointment>(`/appointments/${id}/confirm`, { method: 'POST', auth: true })
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/^\+84/, '0')
  return digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : digits
}

export function formatDateVi(iso: string) {
  return iso.split('-').reverse().join('/')
}
