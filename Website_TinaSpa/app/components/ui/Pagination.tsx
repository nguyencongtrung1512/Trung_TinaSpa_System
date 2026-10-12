import { Icon } from '~/components/ui/Icon'

export interface PaginationRange {
  readonly from: number
  readonly to: number
  readonly total: number
}

export interface PaginationLabels {
  readonly navigation: string
  readonly previous: string
  readonly next: string
  readonly page: (page: number) => string
  /** Return an empty string to hide the summary line. */
  readonly summary: (range: PaginationRange) => string
}

const defaultLabels: PaginationLabels = {
  navigation: 'Phân trang',
  previous: 'Trang trước',
  next: 'Trang sau',
  page: (page) => `Trang ${page}`,
  summary: ({ from, to, total }) => `Hiển thị ${from}–${to} / ${total}`
}

export interface PaginationProps {
  readonly page: number
  readonly pageSize: number
  readonly total: number
  readonly onPageChange: (page: number) => void
  readonly disabled?: boolean
  /** `portal` is compact for admin tables; `site` is the larger touch target for the public website. */
  readonly variant?: 'portal' | 'site'
  readonly labels?: Partial<PaginationLabels>
  readonly className?: string
}

export type PageItem = number | 'gap-start' | 'gap-end'

/** Page numbers to render: always the first, last and current ±`siblings`, with gaps collapsed to an ellipsis. */
export function getPageItems(page: number, totalPages: number, siblings = 1): PageItem[] {
  const slots = siblings * 2 + 5
  if (totalPages <= slots) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const left = Math.max(page - siblings, 2)
  const right = Math.min(page + siblings, totalPages - 1)
  const items: PageItem[] = [1]
  if (left > 2) items.push(left === 3 ? 2 : 'gap-start')
  for (let value = left; value <= right; value += 1) items.push(value)
  if (right < totalPages - 1) items.push(right === totalPages - 2 ? totalPages - 1 : 'gap-end')
  items.push(totalPages)
  return items
}

const sizeClass = {
  portal: 'h-9 min-w-9 px-2 text-sm',
  site: 'h-11 min-w-11 px-3 text-sm'
} as const

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
  variant = 'portal',
  labels,
  className = ''
}: PaginationProps) {
  const text = { ...defaultLabels, ...labels }
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= 0 || totalPages <= 1) return null

  const current = Math.min(Math.max(page, 1), totalPages)
  const from = (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, total)
  const summary = text.summary({ from, to, total })
  const base = `inline-flex items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${sizeClass[variant]}`
  const idle = 'border border-rose-soft bg-surface text-ink hover:border-clinic hover:text-clinic'

  const go = (next: number) => {
    if (!disabled && next !== current && next >= 1 && next <= totalPages) onPageChange(next)
  }

  return (
    <nav
      aria-label={text.navigation}
      className={`flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}
    >
      {summary ? <p className='text-sm text-muted tabular-nums'>{summary}</p> : <span />}
      <ul className='flex flex-wrap items-center justify-center gap-1.5'>
        <li>
          <button
            type='button'
            className={`${base} ${idle}`}
            aria-label={text.previous}
            disabled={disabled || current <= 1}
            onClick={() => go(current - 1)}
          >
            <Icon name='chevron_left' size={18} />
          </button>
        </li>
        {getPageItems(current, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type='button'
                className={`${base} ${item === current ? 'bg-clinic text-white' : idle}`}
                aria-label={text.page(item)}
                aria-current={item === current ? 'page' : undefined}
                disabled={disabled}
                onClick={() => go(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden className='px-1 text-muted'>
              …
            </li>
          )
        )}
        <li>
          <button
            type='button'
            className={`${base} ${idle}`}
            aria-label={text.next}
            disabled={disabled || current >= totalPages}
            onClick={() => go(current + 1)}
          >
            <Icon name='chevron_right' size={18} />
          </button>
        </li>
      </ul>
    </nav>
  )
}
