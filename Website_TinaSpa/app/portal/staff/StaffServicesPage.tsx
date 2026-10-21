import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from '~/components/ui/Icon'
import { formatPortalDate } from '~/portal/format'
import { formatPrice, toSlug } from '~/portal/manager/services/catalog.api'
import { inputClass, outlineButtonClass } from '~/portal/manager/services/form-ui'
import { portalRoleLabel } from '~/portal/navigation'
import { portalCardClass } from '~/portal/styles'
import {
  formatDuration,
  staffCatalogApi,
  type StaffCatalogCategory,
  type StaffCatalogService
} from './staffCatalog.api'

const normalize = (value: string | null | undefined) => toSlug(value ?? '').replaceAll('-', ' ')

function CategoryThumb({
  image,
  size = 'md'
}: {
  readonly image: string | null | undefined
  readonly size?: 'md' | 'lg'
}) {
  const [broken, setBroken] = useState(false)
  const box = size === 'lg' ? 'size-14 rounded-2xl' : 'size-10 rounded-xl'
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden bg-mist text-clinic ${box}`}>
      {image && !broken ? (
        <img src={image} alt='' className='size-full object-cover' onError={() => setBroken(true)} />
      ) : (
        <Icon name='spa' size={size === 'lg' ? 24 : 20} />
      )}
    </span>
  )
}

/** Nhân viên xem dịch vụ đang mở để tư vấn; bấm vào một dịch vụ để mở trang chi tiết. */
export function StaffServicesPage() {
  const reduceMotion = useReducedMotion()
  const [categories, setCategories] = useState<StaffCatalogCategory[]>([])
  const [services, setServices] = useState<StaffCatalogService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)
  const [selected, setSelected] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([staffCatalogApi.categories(), staffCatalogApi.services()])
      .then(([nextCategories, nextServices]) => {
        if (cancelled) return
        setCategories(nextCategories)
        setServices(nextServices)
        setError(undefined)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Không tải được danh mục dịch vụ.')
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const visible = useMemo(() => {
    const query = normalize(search.trim())
    return services.filter(
      (service) =>
        (selected === 'all' || service.category?.serviceCategoryID === selected) &&
        (!query ||
          [
            service.nameVietnamese,
            service.nameEnglish,
            service.shortDescriptionVietnamese,
            service.category?.nameVietnamese
          ].some((value) => normalize(value).includes(query)))
    )
  }, [services, selected, search])

  const countOf = (categoryID: string) =>
    services.filter((service) => service.category?.serviceCategoryID === categoryID).length

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header>
        <div className='flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-clinic'>
          <span>{portalRoleLabel.staff}</span>
          <span className='font-medium tracking-normal text-muted'>{formatPortalDate(new Date())}</span>
        </div>
        <h1 className='mt-2 text-3xl font-extrabold text-ink sm:text-4xl'>Danh mục dịch vụ</h1>
        <p className='mt-1 text-sm text-muted'>
          Dịch vụ đang mở — dùng khi tư vấn cho khách. Bấm vào một dịch vụ để xem mô tả, giá và thời lượng.
        </p>
      </header>

      {error ? (
        <div className={`${portalCardClass} mt-6 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
          <Icon name='cloud_off' size={32} className='text-clinic' />
          <p className='text-sm text-ink'>{error}</p>
          <button type='button' className={outlineButtonClass} onClick={() => setReloadKey((key) => key + 1)}>
            <Icon name='refresh' size={18} />
            Thử lại
          </button>
        </div>
      ) : (
        <div className='mt-6 grid items-start gap-4 lg:grid-cols-[300px_1fr]'>
          <nav className={`${portalCardClass} p-3`} aria-label='Nhóm dịch vụ'>
            <p className='px-2 pt-1 pb-2 text-xs font-bold tracking-[0.16em] text-muted uppercase'>
              Nhóm dịch vụ ({categories.length})
            </p>
            <ul className='space-y-1'>
              {[
                { id: 'all', name: 'Tất cả dịch vụ', image: null, count: services.length },
                ...categories.map((category) => ({
                  id: category.serviceCategoryID,
                  name: category.nameVietnamese,
                  image: category.image,
                  count: countOf(category.serviceCategoryID)
                }))
              ].map((item) => {
                const active = selected === item.id
                return (
                  <li key={item.id}>
                    <button
                      type='button'
                      aria-pressed={active}
                      onClick={() => setSelected(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition ${
                        active ? 'bg-mist text-clinic' : 'text-ink hover:bg-canvas'
                      }`}
                    >
                      {item.id === 'all' ? (
                        <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-white text-clinic shadow-sm'>
                          <Icon name='apps' size={20} />
                        </span>
                      ) : (
                        <CategoryThumb image={item.image} />
                      )}
                      <span className='min-w-0 flex-1'>
                        <span className='block truncate text-sm font-bold'>{item.name}</span>
                        <span className='block text-xs text-muted'>{item.count} dịch vụ</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <section className='min-w-0' aria-label='Danh sách dịch vụ'>
            <div className='relative'>
              <Icon
                name='search'
                size={18}
                className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted'
              />
              <input
                type='search'
                aria-label='Tìm dịch vụ'
                placeholder='Tìm tên dịch vụ, mô tả, nhóm...'
                className={`${inputClass} pl-10`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {loading ? (
              <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className='h-36 animate-pulse rounded-[28px] bg-white/70' />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className={`${portalCardClass} mt-4 flex flex-col items-center gap-3 px-6 py-14 text-center`}>
                <Icon name='spa' size={32} className='text-clinic/60' />
                <p className='text-sm text-muted'>
                  {services.length === 0 ? 'Chưa có dịch vụ nào đang mở.' : 'Không có dịch vụ khớp tìm kiếm.'}
                </p>
              </div>
            ) : (
              <ul className='mt-4 grid gap-3 sm:grid-cols-2'>
                {visible.map((service) => {
                  const duration = formatDuration(service.durationMinutes)
                  return (
                    <li key={service.serviceID}>
                      <Link
                        to={`/portal/staff/services/${encodeURIComponent(service.slug)}`}
                        className={`${portalCardClass} group flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(190,24,96,0.12)]`}
                      >
                        <div className='flex items-start gap-3'>
                          <CategoryThumb image={service.category?.image} />
                          <div className='min-w-0 flex-1'>
                            <p className='font-extrabold text-ink group-hover:text-clinic'>{service.nameVietnamese}</p>
                            <p className='text-xs text-muted'>{service.category?.nameVietnamese}</p>
                          </div>
                          <Icon
                            name='chevron_right'
                            size={20}
                            className='shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-clinic'
                          />
                        </div>
                        {service.shortDescriptionVietnamese ? (
                          <p className='mt-2 line-clamp-2 text-sm text-ink/70'>{service.shortDescriptionVietnamese}</p>
                        ) : null}
                        <div className='mt-auto flex items-center gap-3 pt-3 text-sm'>
                          <span className='font-extrabold text-clinic tabular-nums'>{formatPrice(service.price)}</span>
                          {duration ? (
                            <span className='inline-flex items-center gap-1 text-muted'>
                              <Icon name='schedule' size={16} />
                              {duration}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>
      )}
    </motion.div>
  )
}
