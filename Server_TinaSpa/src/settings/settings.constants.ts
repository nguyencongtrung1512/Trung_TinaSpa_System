export const SettingKey = {
  POPUP_BANNER: 'popupBanner',
} as const;

/** Popup image shown once per visit when a customer opens the website. */
export interface PopupBannerSetting {
  enabled: boolean;
  image: string | null;
  imageAlt: string | null;
  /** Optional link opened when the image is clicked. */
  link: string | null;
}

export const DEFAULT_POPUP_BANNER: PopupBannerSetting = {
  enabled: false,
  image: null,
  imageAlt: null,
  link: null,
};
