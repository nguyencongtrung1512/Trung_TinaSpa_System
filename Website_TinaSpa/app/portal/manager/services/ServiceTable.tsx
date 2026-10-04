import { Icon } from '~/components/ui/Icon'
import { formatPrice, type CatalogService } from './catalog.api'
import { iconButtonClass } from './form-ui'

export interface ServiceTableProps {
  readonly services: readonly CatalogService[]
  readonly showCategory: boolean
  readonly togglingID: string | null
  readonly onEdit: (service: CatalogService) => void
  readonly onDelete: (service: CatalogService) => void
  readonly onToggleStatus: (service: CatalogService) => void
}

export function ServiceTable({
  services,
  showCategory,
  togglingID,
  onEdit,
  onDelete,
  onToggleStatus
}: ServiceTableProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[720px] text-left text-sm'>
        <thead>
          <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
            <th scope='col' className='px-4 py-3'>
              Dịch vụ
            </th>
            {showCategory ? (
              <th scope='col' className='px-4 py-3'>
                Nhóm
              </th>
            ) : null}
            <th scope='col' className='px-4 py-3 text-right'>
              Giá
            </th>
            <th scope='col' className='px-4 py-3 text-right'>
              Thời lượng
            </th>
            <th scope='col' className='px-4 py-3'>
              Trạng thái
            </th>
            <th scope='col' className='px-4 py-3 text-right'>
              <span className='sr-only'>Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const active = service.status === 'ACTIVE'
            return (
              <tr key={service.serviceID} className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'>
                <td className='max-w-[320px] px-4 py-3'>
                  <p className='font-bold text-ink'>{service.nameVietnamese}</p>
                  {service.nameEnglish && service.nameEnglish !== service.nameVietnamese ? (
                    <p className='text-xs text-muted'>{service.nameEnglish}</p>
                  ) : null}
                  {service.shortDescriptionVietnamese ? (
                    <p className='mt-0.5 truncate text-xs text-muted' title={service.shortDescriptionVietnamese}>
                      {service.shortDescriptionVietnamese}
                    </p>
                  ) : null}
                  <p className='mt-1 flex items-center gap-2 text-[11px] text-muted/80'>
                    <span className='font-mono'>{service.slug}</span>
                    {service.isBookable ? null : (
                      <span className='rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700'>
                        Không đặt lịch
                      </span>
                    )}
                  </p>
                </td>
                {showCategory ? <td className='px-4 py-3 text-ink/80'>{service.category?.nameVietnamese}</td> : null}
                <td className='px-4 py-3 text-right font-bold whitespace-nowrap text-ink'>
                  {formatPrice(service.price)}
                </td>
                <td className='px-4 py-3 text-right whitespace-nowrap text-ink/80'>
                  {service.durationMinutes ? `${service.durationMinutes} phút` : '—'}
                </td>
                <td className='px-4 py-3'>
                  <button
                    type='button'
                    onClick={() => onToggleStatus(service)}
                    disabled={togglingID === service.serviceID}
                    title={active ? 'Bấm để tạm ẩn' : 'Bấm để mở lại'}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition disabled:opacity-50 ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-ink/5 text-muted hover:bg-ink/10'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted'}`} />
                    {active ? 'Đang mở' : 'Tạm ẩn'}
                  </button>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex justify-end'>
                    <button
                      type='button'
                      className={iconButtonClass}
                      aria-label={`Sửa ${service.nameVietnamese}`}
                      onClick={() => onEdit(service)}
                    >
                      <Icon name='edit' size={18} />
                    </button>
                    <button
                      type='button'
                      className={`${iconButtonClass} hover:text-red-600`}
                      aria-label={`Xóa ${service.nameVietnamese}`}
                      onClick={() => onDelete(service)}
                    >
                      <Icon name='delete' size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
