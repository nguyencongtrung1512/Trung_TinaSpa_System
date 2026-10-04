import { useTranslation } from 'react-i18next'
import { currentLanguage, languages, setLanguage } from '~/i18n'

export interface LanguageSwitcherProps {
  readonly className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const active = currentLanguage()

  return (
    <div
      role='group'
      aria-label={t('common.language')}
      className={`inline-flex items-center rounded-full border border-rose-soft bg-white/80 p-0.5 text-xs font-bold ${className}`}
    >
      {languages.map((item) => {
        const selected = item.code === active
        return (
          <button
            key={item.code}
            type='button'
            lang={item.code}
            title={item.name}
            aria-pressed={selected}
            onClick={() => void setLanguage(item.code)}
            className={`min-h-8 min-w-9 rounded-full px-2.5 transition-colors ${
              selected ? 'bg-clinic text-white' : 'text-ink/70 hover:text-clinic'
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
