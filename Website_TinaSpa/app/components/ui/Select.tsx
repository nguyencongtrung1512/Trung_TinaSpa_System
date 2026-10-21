import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '~/components/ui/Icon'
import { usePopover } from './usePopover'

export interface SelectOption<T extends string = string> {
  readonly value: T
  readonly label: string
  /** Options sharing a group are listed under that heading (like <optgroup>). */
  readonly group?: string
  readonly disabled?: boolean
}

export interface SelectProps<T extends string> {
  readonly value: T
  readonly options: readonly SelectOption<T>[]
  readonly onChange: (value: T) => void
  /** Shown (muted) when `value` matches no option. */
  readonly placeholder?: string
  readonly id?: string
  readonly name?: string
  readonly disabled?: boolean
  readonly 'aria-label'?: string
  readonly 'aria-invalid'?: boolean
  /** Width / layout classes for the trigger, e.g. `sm:w-44`. */
  readonly className?: string
  /**
   * `field` matches portal inputs; `bare` is unstyled text + chevron, for selects
   * that sit inside a styled wrapper (pill, underline field).
   */
  readonly variant?: 'field' | 'bare'
  /** Adds a search box that filters options by label or group (accent-insensitive). */
  readonly searchable?: boolean
  readonly searchPlaceholder?: string
}

const triggerVariants = {
  field:
    'flex w-full items-center justify-between gap-2 rounded-2xl border border-rose-soft bg-white px-4 py-2.5 text-left text-sm outline-none transition focus-visible:border-clinic focus-visible:ring-2 focus-visible:ring-clinic/15 disabled:cursor-not-allowed disabled:opacity-60',
  bare: 'flex w-full items-center justify-between gap-2 bg-transparent py-2 text-left text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60'
}

const MAX_LIST_HEIGHT = 288
const MIN_LIST_WIDTH = 192
/** Keep in sync with `--animate-popover-out` in app.css. */
const CLOSE_DURATION = 120

/** Lowercase and strip Vietnamese diacritics, so "dich vu" matches "Dịch vụ". */
function fold(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

function highlight(label: string, query: string): ReactNode {
  if (!query) return label
  const chars = Array.from(label)
  const folded = chars.map(fold)
  // Highlighting needs a 1:1 char mapping between the label and its folded form.
  if (folded.some((char) => char.length !== 1)) return label
  const start = folded.join('').indexOf(query)
  if (start < 0) return label
  const end = start + query.length
  return (
    <>
      {chars.slice(0, start).join('')}
      <mark className='rounded bg-mist text-clinic'>{chars.slice(start, end).join('')}</mark>
      {chars.slice(end).join('')}
    </>
  )
}

/** Custom dropdown with the same look as `ActionMenu`; keyboard support follows the WAI-ARIA listbox pattern. */
export function Select<T extends string>({
  value,
  options,
  onChange,
  placeholder,
  id,
  name,
  disabled,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  className = '',
  variant = 'field',
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...'
}: SelectProps<T>) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  // Stays true briefly after closing so the exit animation can play.
  const [rendered, setRendered] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [query, setQuery] = useState('')
  const typeahead = useRef({ text: '', at: 0 })
  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(MIN_LIST_WIDTH)
  const { triggerRef, popoverRef, style } = usePopover<HTMLButtonElement, HTMLDivElement>({
    open,
    onClose: () => setOpen(false),
    width: Math.max(triggerWidth, MIN_LIST_WIDTH)
  })

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined
  const foldedQuery = fold(query.trim())
  const terms = foldedQuery.split(/\s+/).filter(Boolean)
  const visibleIndexes = options.flatMap((option, index) => {
    if (terms.length === 0) return [index]
    const haystack = fold(`${option.label} ${option.group ?? ''}`)
    return terms.every((term) => haystack.includes(term)) ? [index] : []
  })
  const enabledIndexes = visibleIndexes.filter((index) => !options[index].disabled)

  useEffect(() => {
    if (open) {
      setRendered(true)
      return
    }
    const timer = setTimeout(() => setRendered(false), CLOSE_DURATION)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    ;(searchable ? searchRef.current : listRef.current)?.focus()
  }, [open, searchable])

  useEffect(() => {
    if (open && activeIndex >= 0) {
      listRef.current?.querySelector(`[data-index='${activeIndex}']`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeIndex])

  function openList(initialQuery = '') {
    if (disabled) return
    setTriggerWidth(triggerRef.current?.offsetWidth ?? MIN_LIST_WIDTH)
    setQuery(initialQuery)
    setActiveIndex(selectedIndex >= 0 && !initialQuery ? selectedIndex : -1)
    setOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    setOpen(false)
    triggerRef.current?.focus()
    if (option.value !== value) onChange(option.value)
  }

  function step(delta: number) {
    if (enabledIndexes.length === 0) return
    const position = enabledIndexes.indexOf(activeIndex)
    const next = position < 0 ? 0 : Math.min(Math.max(position + delta, 0), enabledIndexes.length - 1)
    setActiveIndex(enabledIndexes[next])
  }

  /** Jump to the next option whose label starts with the typed text. */
  function typeTo(key: string) {
    const now = Date.now()
    typeahead.current = {
      text: now - typeahead.current.at < 600 ? typeahead.current.text + key.toLowerCase() : key.toLowerCase(),
      at: now
    }
    const text = typeahead.current.text
    const match = enabledIndexes.find((index) => options[index].label.toLowerCase().startsWith(text))
    if (match !== undefined) setActiveIndex(match)
  }

  function onSearchChange(next: string) {
    setQuery(next)
    // Keep the highlight on the first match so Enter picks it.
    const nextTerms = fold(next.trim()).split(/\s+/).filter(Boolean)
    const first = options.findIndex(
      (option) =>
        !option.disabled && nextTerms.every((term) => fold(`${option.label} ${option.group ?? ''}`).includes(term))
    )
    setActiveIndex(first)
    listRef.current?.scrollTo({ top: 0 })
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openList()
    } else if (searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Typing on the closed trigger starts a search.
      event.preventDefault()
      openList(event.key)
    }
  }

  function onPopoverKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        step(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        step(-1)
        break
      case 'Home':
      case 'End':
        if (searchable) break // move the caret in the search box
        event.preventDefault()
        setActiveIndex((event.key === 'Home' ? enabledIndexes[0] : enabledIndexes[enabledIndexes.length - 1]) ?? -1)
        break
      case 'Enter':
        event.preventDefault()
        choose(activeIndex)
        break
      case ' ':
        if (searchable) break
        event.preventDefault()
        choose(activeIndex)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        if (!searchable && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          typeTo(event.key)
        }
    }
  }

  const activeDescendant = open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        id={id}
        name={name}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={`${triggerVariants[variant]} ${open && variant === 'field' ? 'border-clinic ring-2 ring-clinic/15' : ''} ${className}`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={`min-w-0 truncate ${selected ? 'text-ink' : 'text-muted'}`}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        <Icon
          name='expand_more'
          size={20}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-clinic' : 'text-muted'}`}
        />
      </button>
      {open || rendered
        ? createPortal(
            <div
              ref={popoverRef}
              style={style}
              onKeyDown={onPopoverKeyDown}
              className={`fixed z-[60] flex flex-col overflow-hidden rounded-2xl border border-rose-soft/70 bg-white shadow-lg ${
                open ? 'motion-safe:animate-popover-in' : 'pointer-events-none motion-safe:animate-popover-out'
              }`}
            >
              {searchable ? (
                <div className='border-b border-rose-soft/50 p-1.5'>
                  <div className='flex items-center gap-2 rounded-xl bg-canvas px-3 transition-shadow focus-within:ring-2 focus-within:ring-clinic/15'>
                    <Icon name='search' size={18} className='shrink-0 text-muted' />
                    <input
                      ref={searchRef}
                      type='text'
                      role='combobox'
                      autoComplete='off'
                      spellCheck={false}
                      aria-label={searchPlaceholder}
                      aria-expanded={open}
                      aria-controls={listId}
                      aria-autocomplete='list'
                      aria-activedescendant={activeDescendant}
                      placeholder={searchPlaceholder}
                      value={query}
                      onChange={(event) => onSearchChange(event.target.value)}
                      className='min-w-0 flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-muted'
                    />
                    {query ? (
                      <button
                        type='button'
                        tabIndex={-1}
                        aria-label='Xóa tìm kiếm'
                        className='grid shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-clinic'
                        onClick={() => {
                          onSearchChange('')
                          searchRef.current?.focus()
                        }}
                      >
                        <Icon name='close' size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <ul
                ref={listRef}
                id={listId}
                role='listbox'
                tabIndex={-1}
                aria-label={ariaLabel}
                aria-activedescendant={searchable ? undefined : activeDescendant}
                style={{ maxHeight: MAX_LIST_HEIGHT }}
                className='overflow-y-auto overscroll-contain p-1.5 outline-none'
              >
                {visibleIndexes.length === 0 ? (
                  <li className='flex items-center gap-2 px-3 py-2 text-sm text-muted motion-safe:animate-popover-in'>
                    {query ? <Icon name='search_off' size={18} className='shrink-0' /> : null}
                    {query ? 'Không tìm thấy kết quả' : 'Không có lựa chọn'}
                  </li>
                ) : (
                  visibleIndexes.map((index, position) => {
                    const option = options[index]
                    const isSelected = index === selectedIndex
                    const isActive = index === activeIndex
                    const previous = position > 0 ? options[visibleIndexes[position - 1]] : undefined
                    const groupStart = option.group && option.group !== previous?.group
                    return [
                      groupStart ? (
                        <li
                          key={`group-${option.group}`}
                          role='presentation'
                          className='px-3 pt-2.5 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase'
                        >
                          {option.group}
                        </li>
                      ) : null,
                      <li
                        key={option.value}
                        id={`${listId}-${index}`}
                        data-index={index}
                        role='option'
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors duration-150 ${
                          option.disabled ? 'cursor-not-allowed text-muted/60' : isSelected ? 'text-clinic' : 'text-ink'
                        } ${isActive && !option.disabled ? (isSelected ? 'bg-mist' : 'bg-canvas') : isSelected ? 'bg-mist/60' : ''}`}
                        onPointerMove={() => !option.disabled && setActiveIndex(index)}
                        onClick={() => choose(index)}
                      >
                        <span className='min-w-0'>{highlight(option.label, foldedQuery)}</span>
                        {isSelected ? <Icon name='check' size={18} className='shrink-0' /> : null}
                      </li>
                    ]
                  })
                )}
              </ul>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
