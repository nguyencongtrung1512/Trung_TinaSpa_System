import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '~/components/ui/Icon'
import { usePopover } from './usePopover'

export interface ActionMenuItem {
  readonly label: string
  readonly icon: string
  readonly onSelect: () => void
  readonly tone?: 'default' | 'danger'
}

export interface ActionMenuProps {
  /** Accessible name of the trigger, e.g. "Thao tác với Nguyễn Văn A". */
  readonly label: string
  readonly items: readonly ActionMenuItem[]
}

/** "⋮" button with a dropdown of actions, portalled so scroll containers don't clip it. */
export function ActionMenu({ label, items }: ActionMenuProps) {
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const { triggerRef, popoverRef, style } = usePopover<HTMLButtonElement, HTMLUListElement>({
    open,
    onClose: () => setOpen(false),
    width: 208,
    align: 'end'
  })

  useEffect(() => {
    if (open) popoverRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }, [open, popoverRef])

  function moveFocus(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button')]
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    buttons[(index + step + buttons.length) % buttons.length]?.focus()
  }

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        aria-label={label}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={`inline-flex size-9 items-center justify-center rounded-full transition ${
          open ? 'bg-mist text-clinic' : 'text-muted hover:bg-mist hover:text-clinic'
        }`}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name='more_vert' size={20} />
      </button>
      {open
        ? createPortal(
            <ul
              ref={popoverRef}
              id={menuId}
              role='menu'
              aria-label={label}
              style={style}
              onKeyDown={moveFocus}
              className='fixed z-[60] rounded-2xl border border-rose-soft/70 bg-white p-1.5 shadow-lg'
            >
              {items.map((item) => (
                <li key={item.label} role='none'>
                  <button
                    type='button'
                    role='menuitem'
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold outline-none ${
                      item.tone === 'danger'
                        ? 'text-red-600 hover:bg-red-50 focus-visible:bg-red-50'
                        : 'text-ink hover:bg-canvas focus-visible:bg-canvas'
                    }`}
                    onClick={() => {
                      setOpen(false)
                      item.onSelect()
                    }}
                  >
                    <Icon name={item.icon} size={18} className={item.tone === 'danger' ? '' : 'text-muted'} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>,
            document.body
          )
        : null}
    </>
  )
}
