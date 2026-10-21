import { apiRequest } from '~/lib/api'

export interface TreatmentResult {
  readonly treatmentResultID: string
  readonly titleVietnamese: string
  readonly titleEnglish: string | null
  /** Headline over the before/after image, e.g. "Nám mảng giảm 88%". */
  readonly resultVietnamese: string
  readonly resultEnglish: string | null
  /** Smaller line under the headline. */
  readonly summaryVietnamese: string | null
  readonly summaryEnglish: string | null
  readonly beforeImage: string
  readonly afterImage: string
  readonly sessionCount: number
  readonly durationWeeks: number
  readonly displayOrder: number
  readonly isActive: boolean
  /** Management reads only. */
  readonly note?: string | null
  readonly updatedAt?: string
}

export type TreatmentResultPayload = Partial<
  Omit<TreatmentResult, 'treatmentResultID' | 'updatedAt' | 'note'> & { readonly note: string | null }
>

export const treatmentResultsApi = {
  /** Visible results for the homepage. */
  list: () => apiRequest<TreatmentResult[]>('/treatment-results'),
  listForManage: () => apiRequest<TreatmentResult[]>('/treatment-results/manage', { auth: true }),
  create: (body: TreatmentResultPayload) =>
    apiRequest<TreatmentResult>('/treatment-results', { method: 'POST', body, auth: true }),
  update: (treatmentResultID: string, body: TreatmentResultPayload) =>
    apiRequest<TreatmentResult>(`/treatment-results/${encodeURIComponent(treatmentResultID)}`, {
      method: 'PATCH',
      body,
      auth: true
    }),
  remove: (treatmentResultID: string) =>
    apiRequest<void>(`/treatment-results/${encodeURIComponent(treatmentResultID)}`, {
      method: 'DELETE',
      auth: true
    })
}
