import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '~/components/ui/Icon'
import { usePopover } from '~/components/ui/usePopover'
import { formatPhone } from '~/portal/appointments/appointments.api'
import { inputClass } from '~/portal/manager/services/form-ui'
import { listUsers, type PortalUser } from '~/portal/users/users.api'
import { cleanPhone } from './customerServices.api'

const MIN_QUERY = 2
const MAX_SUGGESTIONS = 8

/** Phone-looking input is searched without spaces/dots so "0901 234" matches "0901234567". */
function searchTerm(raw: string) {
  const trimmed = raw.trim()
  return /^[\d\s.+\-()]+$/.test(trimmed) ? cleanPhone(trimmed) : trimmed
}

export interface CustomerPickerProps {
  readonly id?: string
  readonly value: string
  readonly onChange: (value: string) => void
  /** Called when a suggestion is chosen; the input already shows the customer's phone. */
  readonly onPick: (customer: PortalUser) => void
  readonly placeholder?: string
}

/**
 * Combobox for the customer desk: type a name or phone, pick from accounts in the staff's area.
 * Typing a full phone number and submitting the form still works for walk-ins without an account.
 */
export function CustomerPicker({ id, value, onChange, onPick, placeholder }: CustomerPickerProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [inputWidth, setInputWidth] = useState(320)
  const { triggerRef, popoverRef, style } = usePopover<HTMLInputElement, HTMLUListElement>({
    open,
    onClose: () => setOpen(false),
    width: inputWidth
  })
  const term = searchTerm(value)

  useEffect(() => {
    if (term.length < MIN_QUERY) {
      setItems([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(() => {
      listUsers({ search: term, role: 'CUSTOMER', page: 1, pageSize: MAX_SUGGESTIONS })
        .then((result) => {
          if (cancelled) return
          setItems(result.items)
          setActiveIndex(result.items.length > 0 ? 0 : -1)
        })
        .catch(() => !cancelled && setItems([]))
        .finally(() => !cancelled && setLoading(false))
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [term])

  function show() {
    setInputWidth(triggerRef.current?.offsetWidth ?? 320)
    setOpen(true)
  }

  function pick(customer: PortalUser) {
    setOpen(false)
    onChange(customer.phone)
    onPick(customer)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) return show()
      if (items.length === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((current) => (current + step + items.length) % items.length)
    } else if (event.key === 'Enter' && open && activeIndex >= 0 && items[activeIndex]) {
      // Choose the highlighted customer instead of submitting the raw text.
      event.preventDefault()
      pick(items[activeIndex])
    }
  }

  const showList = open && term.length >= MIN_QUERY

  return (
    <>
      <div className='relative'>
        <Icon
          name='person_search'
          size={18}
          className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted'
        />
        <input
          ref={triggerRef}
          id={id}
          type='search'
          role='combobox'
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete='list'
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          className={`${inputClass} pl-10`}
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          onChange={(event) => {
            onChange(event.target.value)
            show()
          }}
          onFocus={() => term.length >= MIN_QUERY && show()}
          onKeyDown={onKeyDown}
        />
      </div>
      {showList
        ? createPortal(
            <ul
              ref={popoverRef}
              id={listId}
              role='listbox'
              style={{ ...style, maxHeight: 320 }}
              className='fixed z-[60] overflow-y-auto overscroll-contain rounded-2xl border border-rose-soft/70 bg-white p-1.5 shadow-lg'
            >
              {loading && items.length === 0 ? (
                <li className='px-3 py-2.5 text-sm text-muted'>Đang tìm khách...</li>
              ) : items.length === 0 ? (
                <li className='px-3 py-2.5 text-sm text-muted'>
                  Không tìm thấy khách trong khu vực. Nhập đủ số điện thoại rồi bấm “Tìm khách” để tạo tài khoản mới.
                </li>
              ) : (
                items.map((customer, index) => (
                  <li
                    key={customer.userID}
                    id={`${listId}-${index}`}
                    role='option'
                    aria-selected={index === activeIndex}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${
                      index === activeIndex ? 'bg-canvas' : ''
                    }`}
                    onPointerMove={() => setActiveIndex(index)}
                    // Keep focus in the input so the popover doesn't treat the press as "outside".
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => pick(customer)}
                  >
                    <span className='grid size-9 shrink-0 place-items-center rounded-full bg-mist text-clinic'>
                      <Icon name='person' size={18} />
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm font-bold text-ink'>{customer.fullName}</span>
                      <span className='block truncate text-xs text-muted tabular-nums'>
                        {formatPhone(customer.phone)}
                        {customer.address ? ` · ${customer.address}` : ''}
                      </span>
                    </span>
                    {customer.isActive ? null : (
                      <span className='shrink-0 rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-bold text-muted'>
                        Đã khóa
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>,
            document.body
          )
        : null}
    </>
  )
}
