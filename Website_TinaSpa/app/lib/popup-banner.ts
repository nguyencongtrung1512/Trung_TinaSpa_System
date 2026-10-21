import { apiRequest } from '~/lib/api'

export interface PopupBanner {
  readonly enabled: boolean
  readonly image: string | null
  readonly imageAlt: string | null
  /** Optional link opened when the image is clicked. */
  readonly link: string | null
}

export const popupBannerApi = {
  /** What the website shows; `banner` is null when the popup is off. */
  getPublic: () => apiRequest<{ banner: PopupBanner | null }>('/settings/popup-banner'),
  getForManage: () => apiRequest<PopupBanner>('/settings/popup-banner/manage', { auth: true }),
  save: (body: PopupBanner) => apiRequest<PopupBanner>('/settings/popup-banner', { method: 'PUT', body, auth: true })
}
