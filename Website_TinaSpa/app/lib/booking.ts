import { apiRequest } from '~/lib/api'

export interface Branch {
  readonly branchID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly addressVietnamese: string | null
  readonly addressEnglish: string | null
  readonly addressCambodia: string | null
  readonly hotline: string | null
  readonly openTime: string
  readonly closeTime: string
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface BookingPayload {
  readonly customerName: string
  readonly phoneNumber: string
  readonly branchID: string
  readonly appointmentDate: string
  readonly appointmentTime: string
  readonly customerNote?: string
}

export interface BookingReceipt {
  readonly appointmentID: string
  readonly customerName: string
  readonly appointmentDate: string
  readonly appointmentTime: string
  readonly status: AppointmentStatus
  readonly branch: Branch
}

export const bookingApi = {
  listBranches: () => apiRequest<Branch[]>('/branches'),
  create: (body: BookingPayload) => apiRequest<BookingReceipt>('/appointments', { method: 'POST', body })
}

export function branchName(branch: Branch, language: string) {
  return (language === 'en' ? branch.nameEnglish : null) ?? branch.nameVietnamese
}

export function branchAddress(branch: Branch, language: string) {
  return (language === 'en' ? branch.addressEnglish : null) ?? branch.addressVietnamese
}

/** Start times every `stepMinutes` from opening until (excluding) closing time. */
export function timeOptions(openTime: string, closeTime: string, stepMinutes = 30) {
  const toMinutes = (value: string) => {
    const [hour, minute] = value.split(':').map(Number)
    return hour * 60 + minute
  }
  const options: string[] = []
  for (let minutes = toMinutes(openTime); minutes < toMinutes(closeTime); minutes += stepMinutes) {
    options.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`)
  }
  return options
}

export function localDateIso(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function localTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
