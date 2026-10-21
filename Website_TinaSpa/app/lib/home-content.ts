import { useEffect, useState } from 'react'
import { apiRequest } from '~/lib/api'

/** One card in the homepage "Người đồng hành cùng bạn" section. */
export interface HomeTeamMember {
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly roleVietnamese: string
  readonly roleEnglish: string | null
  readonly image: string
}

/** One step in the homepage "Quy trình làm việc" section; the number comes from its position. */
export interface HomeProcessStep {
  readonly icon: HomeProcessIcon
  readonly titleVietnamese: string
  readonly titleEnglish: string | null
  readonly descriptionVietnamese: string
  readonly descriptionEnglish: string | null
}

export const HOME_TEAM_MAX_MEMBERS = 6
export const HOME_PROCESS_MAX_STEPS = 8

/** Icons the backend accepts for a process step, with a label for the picker. */
export const HOME_PROCESS_ICONS = [
  { value: 'calendar_month', label: 'Lịch hẹn' },
  { value: 'event_available', label: 'Xác nhận lịch' },
  { value: 'support_agent', label: 'Hỗ trợ' },
  { value: 'chat', label: 'Trò chuyện' },
  { value: 'stethoscope', label: 'Bác sĩ' },
  { value: 'medical_services', label: 'Y tế' },
  { value: 'science', label: 'Phân tích' },
  { value: 'healing', label: 'Điều trị' },
  { value: 'spa', label: 'Spa' },
  { value: 'face', label: 'Gương mặt' },
  { value: 'self_care', label: 'Chăm sóc' },
  { value: 'clean_hands', label: 'Vệ sinh' },
  { value: 'water_drop', label: 'Dưỡng ẩm' },
  { value: 'auto_awesome', label: 'Rạng rỡ' },
  { value: 'favorite', label: 'Yêu thích' },
  { value: 'verified', label: 'Đảm bảo' },
  { value: 'monitoring', label: 'Theo dõi' },
  { value: 'home_health', label: 'Tại nhà' }
] as const

export type HomeProcessIcon = (typeof HOME_PROCESS_ICONS)[number]['value']

export const homeContentApi = {
  getTeam: () => apiRequest<{ members: HomeTeamMember[] }>('/settings/home-team'),
  saveTeam: (members: readonly HomeTeamMember[]) =>
    apiRequest<{ members: HomeTeamMember[] }>('/settings/home-team', {
      method: 'PUT',
      body: { members },
      auth: true
    }),
  getProcess: () => apiRequest<{ steps: HomeProcessStep[] }>('/settings/home-process'),
  saveProcess: (steps: readonly HomeProcessStep[]) =>
    apiRequest<{ steps: HomeProcessStep[] }>('/settings/home-process', {
      method: 'PUT',
      body: { steps },
      auth: true
    })
}

/** `undefined` while loading, `null` when the request failed. */
export function useRemote<T>(load: () => Promise<T>): T | null | undefined {
  const [value, setValue] = useState<T | null>()
  useEffect(() => {
    let cancelled = false
    load()
      .then((next) => {
        if (!cancelled) setValue(next)
      })
      .catch(() => {
        if (!cancelled) setValue(null)
      })
    return () => {
      cancelled = true
    }
    // `load` is a stable module-level function at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return value
}

/** Vietnamese is required; other languages fall back to it when left empty. */
export const pickText = (english: boolean, vietnamese: string, translated: string | null) =>
  english && translated ? translated : vietnamese
