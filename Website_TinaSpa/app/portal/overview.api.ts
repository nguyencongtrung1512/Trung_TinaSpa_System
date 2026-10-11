import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '~/lib/api'

export const overviewRanges = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'week', label: '7 ngày' },
  { id: 'month', label: '30 ngày' }
] as const

export type OverviewRange = (typeof overviewRanges)[number]['id']

export interface RecentService {
  readonly customerServiceID: string
  readonly customerName: string
  readonly customerPhone: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly quantity: number
  readonly price: number
  readonly usedAt: string
  readonly staffNote: string | null
}

export interface Overview {
  readonly range: OverviewRange
  readonly revenue: number
  readonly previousRevenue: number
  /** 24 hourly buckets for `today`, one bucket per day otherwise. */
  readonly trend: number[]
  readonly serviceCount: number
  readonly customersServed: number
  readonly newCustomers: number
  readonly appointmentCount: number
  readonly pendingAppointments: number
  readonly recent: RecentService[]
}

export const overviewApi = {
  get: (range: OverviewRange) => apiRequest<Overview>(`/customer-services/overview?range=${range}`, { auth: true })
}

/** Loads the revenue / activity overview and refreshes it every `pollMs`. */
export function useOverview(range: OverviewRange, pollMs = 60_000) {
  const [data, setData] = useState<Overview>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setData(await overviewApi.get(range))
      setError(undefined)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tải được số liệu tổng quan.')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    setLoading(true)
    void refresh()
    const timer = setInterval(() => void refresh(), pollMs)
    return () => clearInterval(timer)
  }, [refresh, pollMs])

  return { data, loading, error, refresh }
}

/** "+12,8% so với kỳ trước", or null when there is nothing to compare with. */
export function changeLabel(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 'Kỳ trước chưa có doanh thu' : null
  const pct = ((current - previous) / previous) * 100
  const text = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(Math.abs(pct))
  return `${pct >= 0 ? '+' : '−'}${text}% so với kỳ trước`
}
