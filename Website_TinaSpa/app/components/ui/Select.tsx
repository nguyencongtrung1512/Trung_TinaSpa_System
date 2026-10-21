import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
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
}

const triggerVariants = {
  field:
    'flex w-full items-center justify-between gap-2 rounded-2xl border border-rose-soft bg-white px-4 py-2.5 text-left text-sm outline-none transition focus-visible:border-clinic focus-visible:ring-2 focus-visible:ring-clinic/15 disabled:cursor-not-allowed disabled:opacity-60',
  bare: 'flex w-full items-center justify-between gap-2 bg-transparent py-2 text-left text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60'
}

const MAX_LIST_HEIGHT = 288
const MIN_LIST_WIDTH = 192

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
  variant = 'field'
}: SelectProps<T>) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const typeahead = useRef({ text: '', at: 0 })
  const [triggerWidth, setTriggerWidth] = useState(MIN_LIST_WIDTH)
  const { triggerRef, popoverRef, style } = usePopover<HTMLButtonElement, HTMLUListElement>({
    open,
    onClose: () => setOpen(false),
    width: Math.max(triggerWidth, MIN_LIST_WIDTH)
  })

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined
  const enabledIndexes = options.flatMap((option, index) => (option.disabled ? [] : [index]))

  useEffect(() => {
    if (!open) return
    popoverRef.current?.focus()
  }, [open, popoverRef])

  useEffect(() => {
    if (open && activeIndex >= 0) {
      popoverRef.current?.querySelector(`[data-index='${activeIndex}']`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeIndex, popoverRef])

  function openList() {
    if (disabled) return
    setTriggerWidth(triggerRef.current?.offsetWidth ?? MIN_LIST_WIDTH)
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1))
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
    const query = typeahead.current.text
    const match = enabledIndexes.find((index) => options[index].label.toLowerCase().startsWith(query))
    if (match !== undefined) setActiveIndex(match)
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openList()
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
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
        event.preventDefault()
        setActiveIndex(enabledIndexes[0] ?? -1)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? -1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(activeIndex)
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) typeTo(event.key)
    }
  }

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
          className={`shrink-0 transition-transform ${open ? 'rotate-180 text-clinic' : 'text-muted'}`}
        />
      </button>
      {open
        ? createPortal(
            <ul
              ref={popoverRef}
              id={listId}
              role='listbox'
              tabIndex={-1}
              aria-label={ariaLabel}
              aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
              style={{ ...style, maxHeight: MAX_LIST_HEIGHT }}
              onKeyDown={onListKeyDown}
              className='fixed z-[60] overflow-y-auto overscroll-contain rounded-2xl border border-rose-soft/70 bg-white p-1.5 shadow-lg outline-none'
            >
              {options.length === 0 ? (
                <li className='px-3 py-2 text-sm text-muted'>Không có lựa chọn</li>
              ) : (
                options.map((option, index) => {
                  const isSelected = index === selectedIndex
                  const isActive = index === activeIndex
                  const groupStart = option.group && option.group !== options[index - 1]?.group
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
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                        option.disabled ? 'cursor-not-allowed text-muted/60' : isSelected ? 'text-clinic' : 'text-ink'
                      } ${isActive && !option.disabled ? (isSelected ? 'bg-mist' : 'bg-canvas') : isSelected ? 'bg-mist/60' : ''}`}
                      onPointerMove={() => !option.disabled && setActiveIndex(index)}
                      onClick={() => choose(index)}
                    >
                      <span className='min-w-0'>{option.label}</span>
                      {isSelected ? <Icon name='check' size={18} className='shrink-0' /> : null}
                    </li>
                  ]
                })
              )}
            </ul>,
            document.body
          )
        : null}
    </>
  )
}
