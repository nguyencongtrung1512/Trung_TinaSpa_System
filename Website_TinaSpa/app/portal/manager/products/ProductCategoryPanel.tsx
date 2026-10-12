import { Icon } from '~/components/ui/Icon'
import { portalCardClass } from '~/portal/styles'
import { iconButtonClass } from '../services/form-ui'
import type { ProductCategory } from './product.api'

export interface ProductCategoryPanelProps {
  readonly categories: readonly ProductCategory[]
  readonly totalProducts: number
  readonly selectedID: string
  readonly onSelect: (id: string) => void
  readonly onEdit: (category: ProductCategory) => void
  readonly onDelete: (category: ProductCategory) => void
}

export function ProductCategoryPanel({
  categories,
  totalProducts,
  selectedID,
  onSelect,
  onEdit,
  onDelete
}: ProductCategoryPanelProps) {
  return (
    <section className={`${portalCardClass} p-3`} aria-label='Danh mục sản phẩm'>
      <p className='px-3 pt-2 pb-3 text-xs font-bold tracking-[0.16em] text-muted uppercase'>
        Danh mục ({categories.length})
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
              <span className='block text-sm font-bold'>Tất cả sản phẩm</span>
              <span className='block text-xs text-muted'>{totalProducts} sản phẩm</span>
            </span>
          </button>
        </li>
        {categories.map((category) => {
          const active = selectedID === category.productCategoryID
          return (
            <li key={category.productCategoryID} className='group relative'>
              <button
                type='button'
                onClick={() => onSelect(category.productCategoryID)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 pr-20 text-left transition ${
                  active ? 'bg-mist text-clinic-deep' : 'text-ink hover:bg-canvas'
                }`}
              >
                <span className='grid size-10 shrink-0 place-items-center rounded-xl bg-white text-clinic shadow-sm'>
                  <Icon name='inventory_2' size={20} />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-bold'>{category.nameVietnamese}</span>
                  <span className='block truncate text-xs text-muted'>{category.productCount} sản phẩm</span>
                  {category.isActive ? null : (
                    <span className='mt-1 inline-block rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-muted'>
                      Tạm ẩn
                    </span>
                  )}
                </span>
              </button>
              <div className='absolute top-1/2 right-2 flex -translate-y-1/2 opacity-100 transition lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100'>
                <button
                  type='button'
                  className={iconButtonClass}
                  aria-label={`Sửa danh mục ${category.nameVietnamese}`}
                  onClick={() => onEdit(category)}
                >
                  <Icon name='edit' size={18} />
                </button>
                <button
                  type='button'
                  className={`${iconButtonClass} hover:text-red-600`}
                  aria-label={`Xóa danh mục ${category.nameVietnamese}`}
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
