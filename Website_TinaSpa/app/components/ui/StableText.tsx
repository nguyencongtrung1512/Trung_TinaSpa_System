import { useTranslation } from 'react-i18next'
import { currentLanguage, languages } from '~/i18n'

export interface StableTextProps {
  readonly i18nKey: string
  readonly values?: Record<string, unknown>
  readonly align?: 'start' | 'center' | 'end'
  readonly block?: boolean
  readonly className?: string
}

const textAlign = {
  start: 'text-left',
  center: 'text-center',
  end: 'text-right'
} as const

const inlineJustify = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end'
} as const

// Every language variant shares one grid cell, so the box always takes the size of the longest
// translation and switching language never shifts surrounding content: inline mode reserves the
// widest width (buttons, links, tabs), block mode reserves the tallest height (headings, paragraphs).
// Hidden variants use `visibility: hidden`, which also removes them from the accessibility tree.
export function StableText({ i18nKey, values, align, block = false, className = '' }: StableTextProps) {
  const { t } = useTranslation()
  const active = currentLanguage()
  const resolvedAlign = align ?? (block ? 'start' : 'center')
  const layout = block ? 'grid' : `inline-grid ${inlineJustify[resolvedAlign]}`

  return (
    <span className={`${layout} ${textAlign[resolvedAlign]} ${className}`}>
      {languages.map((item) => (
        <span
          key={item.code}
          lang={item.code}
          className={`col-start-1 row-start-1 ${item.code === active ? '' : 'invisible'}`}
        >
          {t(i18nKey, { ...values, lng: item.code })}
        </span>
      ))}
    </span>
  )
}
