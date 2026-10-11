import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPhone } from '~/portal/appointments/appointments.api'
import { formatPrice } from '~/portal/manager/services/catalog.api'
import type { RecentService } from '~/portal/overview.api'
import { portalCardClass } from '~/portal/styles'

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

export interface RecentServicesProps {
  readonly items: readonly RecentService[]
  readonly loading: boolean
  readonly error?: string
}

/** Latest services staff recorded for customers (replaces the old mock proposals board). */
export function RecentServices({ items, loading, error }: RecentServicesProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className='mt-6' aria-labelledby='recent-services-title'>
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <h2 id='recent-services-title' className='flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg'>
          <Icon name='receipt_long' size={20} className='text-clinic' />
          Dịch vụ vừa ghi nhận
        </h2>
        <Link
          to='/portal/staff/customer-services'
          className='inline-flex items-center gap-1 text-sm font-bold text-clinic'
        >
          <Icon name='add' size={18} />
          Ghi dịch vụ cho khách
        </Link>
      </div>

      {error ? (
        <p className={`${portalCardClass} p-5 text-sm text-red-700`}>{error}</p>
      ) : !loading && items.length === 0 ? (
        <div className={`${portalCardClass} flex flex-col items-center gap-2 px-6 py-8 text-center`}>
          <Icon name='spa' size={30} className='text-clinic/60' />
          <p className='text-sm text-muted'>Chưa có dịch vụ nào được ghi nhận.</p>
        </div>
      ) : (
        <div className='grid gap-3 lg:grid-cols-2'>
          {items.map((item, index) => (
            <motion.article
              key={item.customerServiceID}
              className={`${portalCardClass} p-5`}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : 0.1 + index * 0.05, ease: 'easeOut' }}
            >
              <div className='flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold tracking-wide text-muted uppercase'>
                <span className='inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-clinic'>
                  <Icon name='person' size={14} />
                  {item.customerName}
                </span>
                <span>{timeFormatter.format(new Date(item.usedAt))}</span>
              </div>
              <h3 className='mt-3 text-base font-extrabold text-ink'>
                {item.nameVietnamese}
                {item.quantity > 1 ? <span className='text-muted'> × {item.quantity}</span> : null}
              </h3>
              {item.staffNote ? <p className='mt-2 text-sm leading-6 text-muted'>{item.staffNote}</p> : null}
              <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
                <span className='text-xs font-semibold text-muted'>{formatPhone(item.customerPhone)}</span>
                <span className='text-sm font-bold text-clinic'>{formatPrice(item.price * item.quantity)}</span>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  )
}
