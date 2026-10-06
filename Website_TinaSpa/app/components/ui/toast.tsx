import { motion } from 'framer-motion'

interface IconProps {
  readonly className?: string
}

const InfoIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
)

const SuccessIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
)

const WarningIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    />
  </svg>
)

const ErrorIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
)

const CloseIcon = ({ className }: IconProps) => (
  <svg className={className} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
  </svg>
)

const LoadingSpinner = ({ className }: IconProps) => (
  <svg className={`animate-spin ${className}`} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
    <path
      className='opacity-75'
      fill='currentColor'
      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
    />
  </svg>
)

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'loading'

export interface NotificationProps {
  readonly type: NotificationType
  readonly title: string
  readonly message?: string
  readonly showIcon?: boolean
  /** Auto-dismiss after this many milliseconds; omit to keep the toast until closed. */
  readonly duration?: number
  readonly onClose: () => void
}

const notificationConfig = {
  info: {
    iconColor: 'text-blue-500',
    icon: <InfoIcon className='h-6 w-6' />,
    gradient: 'from-blue-100/70 to-transparent',
    bar: 'bg-blue-400'
  },
  success: {
    iconColor: 'text-emerald-500',
    icon: <SuccessIcon className='h-6 w-6' />,
    gradient: 'from-emerald-100/70 to-transparent',
    bar: 'bg-emerald-400'
  },
  warning: {
    iconColor: 'text-amber-500',
    icon: <WarningIcon className='h-6 w-6' />,
    gradient: 'from-amber-100/70 to-transparent',
    bar: 'bg-amber-400'
  },
  error: {
    iconColor: 'text-red-500',
    icon: <ErrorIcon className='h-6 w-6' />,
    gradient: 'from-red-100/70 to-transparent',
    bar: 'bg-red-400'
  },
  loading: {
    iconColor: 'text-clinic',
    icon: <LoadingSpinner className='h-6 w-6' />,
    gradient: 'from-pink-100/70 to-transparent',
    bar: 'bg-clinic'
  }
} as const

export default function Notification({ type, title, message, showIcon = true, duration, onClose }: NotificationProps) {
  const config = notificationConfig[type]

  return (
    <motion.div
      layout
      role={type === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.3 }}
      className='pointer-events-auto relative w-full overflow-hidden rounded-xl border border-gray-300/60 bg-white/85 p-4 ring-1 ring-gray-200/40 drop-shadow-xl backdrop-blur-xl'
    >
      <div className={`absolute top-0 left-0 h-full w-full bg-gradient-to-br ${config.gradient} opacity-60`} />
      <div className='relative z-10 flex items-center gap-4'>
        {showIcon ? <div className={`shrink-0 ${config.iconColor}`}>{config.icon}</div> : null}
        <div className='min-w-0 flex-1'>
          <p className='text-[15px] font-semibold text-gray-900'>{title}</p>
          {message ? <p className='mt-1 text-sm text-gray-700'>{message}</p> : null}
        </div>
        <button
          type='button'
          aria-label='Đóng thông báo'
          onClick={onClose}
          className='shrink-0 rounded-full p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'
        >
          <CloseIcon className='h-5 w-5' />
        </button>
      </div>
      {duration ? (
        <div className='absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-xl bg-gray-300/50'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            onAnimationComplete={onClose}
            className={`h-full ${config.bar}`}
          />
        </div>
      ) : null}
    </motion.div>
  )
}
