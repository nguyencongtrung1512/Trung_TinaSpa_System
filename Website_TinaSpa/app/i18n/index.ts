import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next, useTranslation } from 'react-i18next'
import en from './locales/en'
import vi from './locales/vi'

export const languages = [
  { code: 'vi', label: 'VI', name: 'Tiếng Việt' },
  { code: 'en', label: 'EN', name: 'English' }
] as const

export type Language = (typeof languages)[number]['code']

export const defaultLanguage: Language = 'vi'

const storageKey = 'tinaspa-lang'

// Always start in the default language so the client's first render matches the prerendered HTML;
// the stored/browser language is applied after hydration by `applyDetectedLanguage`.
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en }
    },
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    supportedLngs: languages.map((item) => item.code),
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: storageKey,
      caches: []
    },
    react: { useSuspense: false }
  })

export function currentLanguage(): Language {
  return i18n.resolvedLanguage === 'en' ? 'en' : 'vi'
}

export function applyDetectedLanguage() {
  return i18n.changeLanguage()
}

export function setLanguage(language: Language) {
  try {
    window.localStorage.setItem(storageKey, language)
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this session only.
  }
  return i18n.changeLanguage(language)
}

export function useContent<T>(key: string): T {
  const { t } = useTranslation()
  return t(key, { returnObjects: true }) as T
}

export default i18n
