import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'

export interface PopoverOptions {
  readonly open: boolean
  readonly onClose: () => void
  /** Fixed width in px, or `'trigger'` to match the trigger's width. */
  readonly width: number | 'trigger'
  /** Which edge of the trigger the popover lines up with. */
  readonly align?: 'start' | 'end'
}

const GAP = 6
const MARGIN = 8

/**
 * Positions a popover (menu, listbox) under its trigger with `position: fixed`, so it can be
 * portalled to <body> and escape scroll containers and dialogs. Flips above the trigger when
 * there is no room below, and closes on outside press, Escape, resize or page scroll.
 */
export function usePopover<T extends HTMLElement, P extends HTMLElement>({
  open,
  onClose,
  width,
  align = 'start'
}: PopoverOptions) {
  const triggerRef = useRef<T>(null)
  const popoverRef = useRef<P>(null)
  const [style, setStyle] = useState<CSSProperties>({ top: -9999, left: -9999 })
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverWidth = width === 'trigger' ? rect.width : width
    const height = popoverRef.current?.offsetHeight ?? 0
    const fitsBelow = rect.bottom + GAP + height <= window.innerHeight - MARGIN
    const fitsAbove = rect.top - GAP - height >= MARGIN
    const left = align === 'end' ? rect.right - popoverWidth : rect.left
    setStyle({
      top: fitsBelow || !fitsAbove ? rect.bottom + GAP : rect.top - GAP - height,
      left: Math.min(Math.max(MARGIN, left), window.innerWidth - popoverWidth - MARGIN),
      width: popoverWidth
    })
  }, [open, width, align])

  useEffect(() => {
    if (!open) return
    const close = () => onCloseRef.current()
    const inside = (target: EventTarget | null) =>
      target instanceof Node && (popoverRef.current?.contains(target) || triggerRef.current?.contains(target))
    const onPointer = (event: PointerEvent) => {
      if (!inside(event.target)) close()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      // Capture phase: close just this popover, not a dialog underneath.
      event.stopPropagation()
      close()
      triggerRef.current?.focus()
    }
    // Scrolling the popover's own list is fine; scrolling the page would detach it from the trigger.
    const onScroll = (event: Event) => {
      if (!inside(event.target)) close()
    }
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  return { triggerRef, popoverRef, style }
}
