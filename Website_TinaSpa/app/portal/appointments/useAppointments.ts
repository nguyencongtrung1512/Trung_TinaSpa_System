import { useCallback, useEffect, useState } from 'react'
import { bookingApi, type Branch } from '~/lib/booking'
import { appointmentsApi, type Appointment, type AppointmentQuery } from './appointments.api'

let branchesRequest: Promise<Branch[]> | null = null

/** Call after creating/editing branches so the next `useBranches()` mount refetches. */
export function invalidateBranches() {
  branchesRequest = null
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    let active = true
    branchesRequest ??= bookingApi.listBranches().catch((error: unknown) => {
      branchesRequest = null
      throw error
    })
    branchesRequest.then((items) => active && setBranches(items)).catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  return branches
}

/** Loads appointments for a query and refreshes them every `pollMs` while mounted. */
export function useAppointments({ date, branchID, status }: AppointmentQuery, pollMs = 60_000) {
  const [items, setItems] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setItems(await appointmentsApi.list({ date, branchID, status }))
      setError(undefined)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không tải được lịch hẹn.')
    } finally {
      setLoading(false)
    }
  }, [date, branchID, status])

  useEffect(() => {
    setLoading(true)
    void refresh()
    const timer = setInterval(() => void refresh(), pollMs)
    return () => clearInterval(timer)
  }, [refresh, pollMs])

  const replace = useCallback((next: Appointment) => {
    setItems((current) => current.map((item) => (item.appointmentID === next.appointmentID ? next : item)))
  }, [])

  return { items, loading, error, refresh, replace }
}
