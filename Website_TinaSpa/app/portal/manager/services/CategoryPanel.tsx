import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import { formatPrice, type CatalogCategory } from './catalog.api'
import { iconButtonClass } from './form-ui'

export interface CategoryPanelProps {
  readonly categories: readonly CatalogCategory[]
  readonly totalServices: number
  readonly selectedID: string
  readonly onSelect: (id: string) => void
  readonly onEdit: (category: CatalogCategory) => void
  readonly onDelete: (category: CatalogCategory) => void
}

export function CategoryPanel({
  categories,
  totalServices,
  selectedID,
  onSelect,
  onEdit,
  onDelete
}: CategoryPanelProps) {
  return (
    <section className={`${portalCardClass} p-3`} aria-label='Nhóm dịch vụ'>
      <p className='px-3 pt-2 pb-3 text-xs font-bold tracking-[0.16em] text-muted uppercase'>
        Nhóm dịch vụ ({categories.length})
      </p>
      <ul className='space-y-1'>
        <li>
          <button
            type='button'
            onClick={() => onSelect('all')}
            aria-pressed={selectedID === 'all'}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
              selectedID === 'all' ? 'bg-mist text-clinic-deep' : 'text-ink hover:bg-canvas'
            }`}
          >
            <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-white text-clinic shadow-sm'>
              <Icon name='apps' size={20} />
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-sm font-bold'>Tất cả dịch vụ</span>
              <span className='block text-xs text-muted'>{totalServices} dịch vụ</span>
            </span>
          </button>
        </li>
        {categories.map((category) => {
          const active = selectedID === category.serviceCategoryID
          return (
            <li key={category.serviceCategoryID} className='group relative'>
              <button
                type='button'
                onClick={() => onSelect(category.serviceCategoryID)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 pr-20 text-left transition ${
                  active ? 'bg-mist text-clinic-deep' : 'text-ink hover:bg-canvas'
                }`}
              >
                <span className='grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-clinic shadow-sm'>
                  {category.image ? (
                    <img src={category.image} alt='' className='size-full object-cover' />
                  ) : (
                    <Icon name={category.icon ?? 'spa'} size={20} />
                  )}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='flex items-center gap-1.5'>
                    <span className='truncate text-sm font-bold'>{category.nameVietnamese}</span>
                    {category.isFeatured ? (
                      <Icon name='star' size={14} filled className='shrink-0 text-amber-500' />
                    ) : null}
                  </span>
                  <span className='block truncate text-xs text-muted'>
                    {category.serviceCount} dịch vụ
                    {category.minPrice !== null ? ` · từ ${formatPrice(category.minPrice)}` : ''}
                  </span>
                  {category.status === 'INACTIVE' ? (
                    <span className='mt-1 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-muted'>
                      Tạm ẩn
                    </span>
                  ) : null}
                </span>
              </button>
              <div className='absolute top-1/2 right-2 flex -translate-y-1/2 opacity-100 transition lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100'>
                <button
                  type='button'
                  className={iconButtonClass}
                  aria-label={`Sửa nhóm ${category.nameVietnamese}`}
                  onClick={() => onEdit(category)}
                >
                  <Icon name='edit' size={18} />
                </button>
                <button
                  type='button'
                  className={`${iconButtonClass} hover:text-red-600`}
                  aria-label={`Xóa nhóm ${category.nameVietnamese}`}
                  onClick={() => onDelete(category)}
                >
                  <Icon name='delete' size={18} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
