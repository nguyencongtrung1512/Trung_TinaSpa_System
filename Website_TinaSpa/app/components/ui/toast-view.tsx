import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import Notification, { type NotificationType } from './toast'

export interface ToastOptions {
  readonly type: NotificationType
  readonly title: string
  readonly message?: string
  readonly showIcon?: boolean
  readonly duration?: number
}

interface ToastItem extends ToastOptions {
  readonly id: number
}

export interface ToastApi {
  readonly show: (options: ToastOptions) => number
  readonly success: (title: string, message?: string) => number
  readonly error: (title: string, message?: string) => number
  readonly info: (title: string, message?: string) => number
  readonly warning: (title: string, message?: string) => number
  /** Stays until `update`d (e.g. into success/error) or dismissed. */
  readonly loading: (title: string, message?: string) => number
  readonly update: (id: number, options: ToastOptions) => void
  readonly dismiss: (id: number) => void
}

const defaultDuration: Record<NotificationType, number | undefined> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 6000,
  loading: undefined
}

const MAX_TOASTS = 4

const withDefaults = (options: ToastOptions): ToastOptions => ({
  ...options,
  duration: options.duration ?? defaultDuration[options.type]
})

const noop = () => 0
const ToastContext = createContext<ToastApi>({
  show: noop,
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
  loading: noop,
  update: () => undefined,
  dismiss: () => undefined
})

export function useToast() {
  return useContext(ToastContext)
}

/** Provides `useToast()` and renders the stack in the top-right corner. */
export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const show = useCallback((options: ToastOptions) => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, ...withDefaults(options) }].slice(-MAX_TOASTS))
    return id
  }, [])

  const update = useCallback((id: number, options: ToastOptions) => {
    setToasts((current) => {
      if (!current.some((toast) => toast.id === id)) {
        return [...current, { id, ...withDefaults(options) }].slice(-MAX_TOASTS)
      }
      return current.map((toast) => (toast.id === id ? { id, ...withDefaults(options) } : toast))
    })
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      update,
      dismiss,
      success: (title, message) => show({ type: 'success', title, message }),
      error: (title, message) => show({ type: 'error', title, message }),
      info: (title, message) => show({ type: 'info', title, message }),
      warning: (title, message) => show({ type: 'warning', title, message }),
      loading: (title, message) => show({ type: 'loading', title, message })
    }),
    [show, update, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live='polite'
        className='pointer-events-none fixed top-4 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2'
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <Notification
              // Remount when the type changes so the progress bar restarts (loading -> success).
              key={`${toast.id}-${toast.type}`}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              showIcon={toast.showIcon}
              duration={toast.duration}
              onClose={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
