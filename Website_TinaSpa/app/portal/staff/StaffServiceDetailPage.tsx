import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPrice } from '~/portal/manager/services/catalog.api'
import { outlineButtonClass, primaryButtonClass } from '~/portal/manager/services/form-ui'
import { portalCardClass } from '~/portal/styles'
import { formatDuration, staffCatalogApi, type StaffCatalogService } from './staffCatalog.api'

function Fact({
  icon,
  label,
  children
}: {
  readonly icon: string
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <div className='rounded-2xl bg-canvas px-4 py-3'>
      <p className='flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted uppercase'>
        <Icon name={icon} size={16} className='text-clinic' />
        {label}
      </p>
      <p className='mt-1 text-lg font-extrabold text-ink tabular-nums'>{children}</p>
    </div>
  )
}

export function StaffServiceDetailPage() {
  const { slug = '' } = useParams()
  const reduceMotion = useReducedMotion()
  const [service, setService] = useState<StaffCatalogService>()
  const [related, setRelated] = useState<StaffCatalogService[]>([])
  const [error, setError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    let cancelled = false
    setService(undefined)
    setError(undefined)
    setImageBroken(false)
    staffCatalogApi
      .service(slug)
      .then(async (next) => {
        if (cancelled) return
        setService(next)
        const siblings = next.category ? await staffCatalogApi.servicesInCategory(next.category.slug) : []
        if (!cancelled) setRelated(siblings.filter((item) => item.serviceID !== next.serviceID))
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Không tải được dịch vụ.')
      })
    return () => {
      cancelled = true
    }
  }, [slug, reloadKey])

  const backLink = (
    <Link
      to='/portal/staff/services'
      className='inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-clinic'
    >
      <Icon name='arrow_back' size={18} />
      Danh mục dịch vụ
    </Link>
  )

  if (error) {
    return (
      <div>
        {backLink}
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='spa' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{error}</p>
          <button type='button' className={outlineButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div>
        {backLink}
        <div className='mt-6 grid gap-4 lg:grid-cols-[1fr_320px]'>
          <div className='h-96 animate-pulse rounded-[28px] bg-white/70' />
          <div className='h-64 animate-pulse rounded-[28px] bg-white/70' />
        </div>
      </div>
    )
  }

  const duration = formatDuration(service.durationMinutes)
  const image = service.category?.image

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {backLink}

      <div className='mt-4 grid items-start gap-4 lg:grid-cols-[1fr_320px]'>
        <article className={`${portalCardClass} overflow-hidden`}>
          {image && !imageBroken ? (
            <img
              src={image}
              alt={service.category?.imageAlt ?? ''}
              className='aspect-[21/8] w-full object-cover'
              onError={() => setImageBroken(true)}
            />
          ) : null}
          <div className='p-5 sm:p-6'>
            <p className='text-xs font-bold tracking-[0.16em] text-clinic uppercase'>
              {service.category?.nameVietnamese}
            </p>
            <h1 className='mt-1 text-3xl font-extrabold text-ink sm:text-4xl'>{service.nameVietnamese}</h1>
            {service.nameEnglish ? <p className='mt-1 text-sm text-muted italic'>{service.nameEnglish}</p> : null}

            <div className='mt-5 grid gap-3 sm:grid-cols-3'>
              <Fact icon='payments' label='Giá'>
                {formatPrice(service.price)}
              </Fact>
              <Fact icon='schedule' label='Thời lượng'>
                {duration ?? '—'}
              </Fact>
              <Fact icon='event_available' label='Đặt lịch online'>
                {service.isBookable ? 'Có' : 'Không'}
              </Fact>
            </div>

            {service.shortDescriptionVietnamese ? (
              <p className='mt-5 text-base leading-7 font-semibold text-ink/90'>{service.shortDescriptionVietnamese}</p>
            ) : null}

            <h2 className='mt-6 text-sm font-bold tracking-wide text-muted uppercase'>Mô tả chi tiết</h2>
            <p className='mt-2 text-sm leading-7 whitespace-pre-line text-ink/80'>
              {service.descriptionVietnamese ?? 'Chưa có mô tả chi tiết cho dịch vụ này.'}
            </p>

            {service.descriptionEnglish ? (
              <details className='mt-5 rounded-2xl bg-canvas px-4 py-3'>
                <summary className='cursor-pointer text-sm font-semibold text-ink'>
                  Mô tả tiếng Anh (cho khách nước ngoài)
                </summary>
                <p className='mt-2 text-sm leading-7 whitespace-pre-line text-ink/80'>{service.descriptionEnglish}</p>
              </details>
            ) : null}

            <div className='mt-6 flex flex-wrap gap-2 border-t border-rose-soft/40 pt-5'>
              <Link to='/portal/staff/customer-services' className={primaryButtonClass}>
                <Icon name='receipt_long' size={18} />
                Ghi dịch vụ cho khách
              </Link>
              <Link to='/portal/staff/appointments' className={outlineButtonClass}>
                <Icon name='calendar_month' size={18} />
                Xem lịch hẹn
              </Link>
            </div>
          </div>
        </article>

        <aside className={`${portalCardClass} p-4`} aria-label='Dịch vụ cùng nhóm'>
          <h2 className='px-1 text-sm font-bold tracking-wide text-muted uppercase'>
            Cùng nhóm {service.category?.nameVietnamese}
          </h2>
          {related.length === 0 ? (
            <p className='px-1 py-6 text-sm text-muted'>Không có dịch vụ khác trong nhóm.</p>
          ) : (
            <ul className='mt-2 space-y-1'>
              {related.map((item) => (
                <li key={item.serviceID}>
                  <Link
                    to={`/portal/staff/services/${encodeURIComponent(item.slug)}`}
                    className='flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-canvas'
                  >
                    <span className='min-w-0'>
                      <span className='block truncate text-sm font-bold text-ink'>{item.nameVietnamese}</span>
                      <span className='block text-xs text-muted'>
                        {formatDuration(item.durationMinutes) ?? 'Chưa đặt thời lượng'}
                      </span>
                    </span>
                    <span className='shrink-0 text-sm font-extrabold text-clinic tabular-nums'>
                      {formatPrice(item.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </motion.div>
  )
}
