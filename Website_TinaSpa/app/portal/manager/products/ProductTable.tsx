import { Icon } from '~/components/ui/Icon'
import { formatPrice } from '../services/catalog.api'
import { iconButtonClass } from '../services/form-ui'
import type { Product } from './product.api'

export interface ProductTableProps {
  readonly products: readonly Product[]
  readonly showCategory: boolean
  readonly togglingID: string | null
  readonly onEdit: (product: Product) => void
  readonly onDelete: (product: Product) => void
  readonly onToggleStatus: (product: Product) => void
}

export function ProductTable({ products, showCategory, togglingID, onEdit, onDelete, onToggleStatus }: ProductTableProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-[720px] text-left text-sm'>
        <thead>
          <tr className='border-b border-rose-soft/60 text-[11px] font-bold tracking-wide text-muted uppercase'>
            <th scope='col' className='px-4 py-3'>
              Sản phẩm
            </th>
            {showCategory ? (
              <th scope='col' className='px-4 py-3'>
                Danh mục
              </th>
            ) : null}
            <th scope='col' className='px-4 py-3 text-right'>
              Giá
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
          {products.map((product) => {
            const active = product.status === 'ACTIVE'
            return (
              <tr key={product.productID} className='border-b border-rose-soft/40 last:border-0 hover:bg-canvas/60'>
                <td className='max-w-[320px] px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <span className='grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-canvas text-clinic'>
                      {product.image ? (
                        <img src={product.image} alt='' className='size-full object-cover' />
                      ) : (
                        <Icon name='inventory_2' size={20} />
                      )}
                    </span>
                    <div className='min-w-0'>
                      <p className='truncate font-bold text-ink'>{product.nameVietnamese}</p>
                      {product.subtitleVietnamese ? (
                        <p className='truncate text-xs text-muted' title={product.subtitleVietnamese}>
                          {product.subtitleVietnamese}
                        </p>
                      ) : null}
                      <p className='font-mono text-[11px] text-muted/80'>{product.slug}</p>
                    </div>
                  </div>
                </td>
                {showCategory ? <td className='px-4 py-3 text-ink/80'>{product.category.nameVietnamese}</td> : null}
                <td className='px-4 py-3 text-right whitespace-nowrap'>
                  <p className='font-bold text-ink'>
                    {product.variants.length > 1 ? 'Từ ' : ''}
                    {formatPrice(product.price)}
                  </p>
                  <p className='text-xs text-muted'>{product.variants.length} phiên bản</p>
                  {product.compareAtPrice ? (
                    <p className='text-xs text-muted line-through'>{formatPrice(product.compareAtPrice)}</p>
                  ) : null}
                </td>
                <td className='px-4 py-3'>
                  <button
                    type='button'
                    onClick={() => onToggleStatus(product)}
                    disabled={togglingID === product.productID}
                    title={active ? 'Bấm để tạm ẩn' : 'Bấm để mở lại'}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap transition disabled:opacity-50 ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-ink/5 text-muted hover:bg-ink/10'
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-muted'}`} />
                    {active ? 'Đang bán' : 'Tạm ẩn'}
                  </button>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex justify-end'>
                    <button
                      type='button'
                      className={iconButtonClass}
                      aria-label={`Sửa ${product.nameVietnamese}`}
                      onClick={() => onEdit(product)}
                    >
                      <Icon name='edit' size={18} />
                    </button>
                    <button
                      type='button'
                      className={`${iconButtonClass} hover:text-red-600`}
                      aria-label={`Xóa ${product.nameVietnamese}`}
                      onClick={() => onDelete(product)}
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
