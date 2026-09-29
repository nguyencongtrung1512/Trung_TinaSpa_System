import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  categoryLabel,
  formatPrice,
  matchesPrice,
  priceFilters,
  productCategories,
  products,
  sortOptions,
  type PriceFilterId,
  type ProductCategoryId,
  type ProductItem,
  type SortId
} from '~/data/products'
import { Icon } from '~/components/ui/Icon'

function formatRating(value: number) {
  return value.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function Stars({ rating }: { readonly rating: number }) {
  return (
    <span className='inline-flex items-center text-clinic' aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = rating >= index + 1
        const half = !filled && rating > index
        return <Icon key={index} name={half ? 'star_half' : 'star'} filled={filled || half} size={16} />
      })}
    </span>
  )
}

interface ProductCardProps {
  readonly product: ProductItem
  readonly layout: 'grid' | 'list'
  readonly saved: boolean
  readonly added: boolean
  readonly onToggleSaved: (id: string) => void
  readonly onToggleAdded: (id: string) => void
}

function ProductCard({ product, layout, saved, added, onToggleSaved, onToggleAdded }: ProductCardProps) {
  const isList = layout === 'list'

  return (
    <article
      className={`group overflow-hidden rounded-[1.35rem] bg-surface shadow-[0_12px_32px_var(--color-whisper-shadow)] transition hover:-translate-y-1 ${
        isList ? 'flex flex-col sm:flex-row' : 'flex flex-col'
      }`}
    >
      <div className={`relative overflow-hidden bg-mist ${isList ? 'sm:w-64 sm:shrink-0' : ''}`}>
        <Link to={`/products/${product.id}`} className='block'>
          <img
            src={product.image}
            alt={product.imageAlt}
            className={`w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
              isList ? 'aspect-[4/3] sm:aspect-auto sm:h-full' : 'aspect-[4/3]'
            }`}
          />
        </Link>
        <span className='absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-clinic uppercase'>
          {product.badge}
        </span>
        <button
          type='button'
          aria-pressed={saved}
          aria-label={saved ? `Bỏ yêu thích ${product.name}` : `Yêu thích ${product.name}`}
          onClick={() => onToggleSaved(product.id)}
          className='absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-clinic shadow-sm transition hover:bg-white'
        >
          <Icon name='favorite' filled={saved} size={20} />
        </button>
      </div>

      <div className='flex flex-1 flex-col p-4 sm:p-5'>
        <p className='text-[11px] font-semibold tracking-[0.14em] text-muted uppercase'>
          {categoryLabel(product.category)}
        </p>
        <h2 className='mt-1 text-base font-extrabold tracking-tight text-ink'>
          <Link to={`/products/${product.id}`} className='transition hover:text-clinic'>
            {product.name}
          </Link>
        </h2>
        <p className='mt-0.5 text-xs font-medium text-muted'>{product.subtitle}</p>
        <p className={`mt-2 text-sm leading-6 text-muted ${isList ? '' : 'line-clamp-2'}`}>{product.description}</p>
        <p className='mt-2 flex items-center gap-2 text-xs text-muted'>
          <Stars rating={product.rating} />
          <span>
            <span className='sr-only'>Đánh giá </span>
            {formatRating(product.rating)} ({product.reviews})
          </span>
          <span aria-hidden>·</span>
          <span>{product.volume}</span>
        </p>
        <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
          <p className='text-lg font-extrabold text-clinic'>
            <span className='sr-only'>Giá </span>
            {formatPrice(product.price)}
          </p>
          <button
            type='button'
            aria-pressed={added}
            aria-label={added ? `Bỏ ${product.name} khỏi giỏ` : `Thêm ${product.name} vào giỏ`}
            onClick={() => onToggleAdded(product.id)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${
              added ? 'bg-clinic text-white' : 'bg-mist text-clinic hover:bg-rose-soft'
            }`}
          >
            <Icon name={added ? 'check' : 'shopping_bag'} size={20} />
          </button>
        </div>
      </div>
    </article>
  )
}

function toggleId(current: ReadonlySet<string>, id: string) {
  const next = new Set(current)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export function ProductsPage() {
  const [category, setCategory] = useState<ProductCategoryId>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortId>('newest')
  const [price, setPrice] = useState<PriceFilterId>('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set())
  const [addedIds, setAddedIds] = useState<ReadonlySet<string>>(new Set())
  const [notice, setNotice] = useState('')

  const visible = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase('vi')
    const filtered = products.filter((product) => {
      const inCategory = category === 'all' || product.category === category
      const inPrice = matchesPrice(product.price, price)
      const haystack = `${product.name} ${product.subtitle} ${product.description} ${categoryLabel(product.category)}`
      const inQuery = keyword.length === 0 || haystack.toLocaleLowerCase('vi').includes(keyword)
      return inCategory && inPrice && inQuery
    })

    return [...filtered].sort((left, right) => {
      if (sort === 'price-asc') return left.price - right.price
      if (sort === 'price-desc') return right.price - left.price
      if (sort === 'rating') return right.rating - left.rating || right.reviews - left.reviews
      return right.createdAt.localeCompare(left.createdAt)
    })
  }, [category, price, query, sort])

  function resetFilters() {
    setCategory('all')
    setQuery('')
    setSort('newest')
    setPrice('all')
  }

  function onToggleAdded(id: string) {
    const product = products.find((item) => item.id === id)
    const willAdd = !addedIds.has(id)
    setAddedIds((current) => toggleId(current, id))
    setNotice(product ? (willAdd ? `Đã thêm ${product.name} vào giỏ.` : `Đã bỏ ${product.name} khỏi giỏ.`) : '')
  }

  return (
    <div className='bg-canvas'>
      <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14'>
        <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>Bộ sưu tập chăm sóc da</p>
        <h1 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>Sản phẩm Dr Tina Beauty</h1>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-muted'>
          Tinh chất, kem dưỡng, chống nắng và mặt nạ phục hồi được phòng khám chọn để dùng sau liệu trình.
        </p>

        <div
          className='mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          role='group'
          aria-label='Nhóm sản phẩm'
        >
          {productCategories.map((item) => {
            const active = category === item.id
            return (
              <button
                key={item.id}
                type='button'
                aria-pressed={active}
                onClick={() => setCategory(item.id)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-clinic text-white shadow-[0_8px_20px_var(--color-whisper-shadow)]'
                    : 'border border-rose-soft bg-surface text-ink hover:border-clinic hover:text-clinic'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className='mt-5 flex flex-col gap-3 rounded-[1.35rem] bg-surface p-3 shadow-[0_8px_24px_var(--color-whisper-shadow)] lg:flex-row lg:items-center'>
          <label className='relative min-w-0 flex-1'>
            <span className='sr-only'>Tìm sản phẩm</span>
            <Icon
              name='search'
              size={20}
              className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted'
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Tìm tinh chất, kem dưỡng, mặt nạ...'
              className='h-11 w-full rounded-full border border-rose-soft bg-canvas pr-4 pl-11 text-sm text-ink outline-none placeholder:text-muted focus:border-clinic focus:ring-2 focus:ring-clinic/20'
            />
          </label>

          <label className='flex h-11 items-center gap-2 rounded-full border border-rose-soft bg-canvas px-4 text-sm'>
            <span className='shrink-0 font-semibold text-muted'>Sắp xếp</span>
            <select
              value={sort}
              aria-label='Sắp xếp sản phẩm'
              onChange={(event) => setSort(event.target.value as SortId)}
              className='bg-transparent font-semibold text-ink outline-none'
            >
              {sortOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className='flex h-11 items-center gap-2 rounded-full border border-rose-soft bg-canvas px-4 text-sm'>
            <span className='shrink-0 font-semibold text-muted'>Giá</span>
            <select
              value={price}
              aria-label='Lọc theo khoảng giá'
              onChange={(event) => setPrice(event.target.value as PriceFilterId)}
              className='bg-transparent font-semibold text-ink outline-none'
            >
              {priceFilters.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <div className='flex items-center justify-end gap-1' role='group' aria-label='Kiểu hiển thị'>
            <button
              type='button'
              aria-pressed={layout === 'grid'}
              aria-label='Xem dạng lưới'
              onClick={() => setLayout('grid')}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                layout === 'grid' ? 'bg-clinic text-white' : 'text-muted hover:text-clinic'
              }`}
            >
              <Icon name='grid_view' size={20} />
            </button>
            <button
              type='button'
              aria-pressed={layout === 'list'}
              aria-label='Xem dạng danh sách'
              onClick={() => setLayout('list')}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${
                layout === 'list' ? 'bg-clinic text-white' : 'text-muted hover:text-clinic'
              }`}
            >
              <Icon name='view_list' size={20} />
            </button>
          </div>
        </div>

        <p className='mt-4 text-sm text-muted' role='status'>
          {visible.length} sản phẩm
          {addedIds.size > 0 ? ` · ${addedIds.size} trong giỏ` : ''}
          {savedIds.size > 0 ? ` · ${savedIds.size} yêu thích` : ''}
        </p>

        {visible.length === 0 ? (
          <div className='mt-6 rounded-[1.5rem] bg-surface px-6 py-16 text-center shadow-[0_12px_32px_var(--color-whisper-shadow)]'>
            <span className='mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-mist text-clinic'>
              <Icon name='search_off' size={32} />
            </span>
            <h2 className='mt-4 text-xl font-extrabold text-ink'>Không có sản phẩm khớp bộ lọc</h2>
            <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-muted'>
              Thử từ khóa khác, hoặc xem lại toàn bộ bộ sưu tập.
            </p>
            <button
              type='button'
              onClick={resetFilters}
              className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 py-2.5 text-sm font-semibold text-white'
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        ) : (
          <div className={layout === 'grid' ? 'mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'mt-6 grid gap-5'}>
            {visible.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                layout={layout}
                saved={savedIds.has(product.id)}
                added={addedIds.has(product.id)}
                onToggleSaved={(id) => setSavedIds((current) => toggleId(current, id))}
                onToggleAdded={onToggleAdded}
              />
            ))}
          </div>
        )}

        <p className='sr-only' aria-live='polite'>
          {notice}
        </p>
      </section>

      <section className='px-4 pb-16 sm:px-6'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8 rounded-[1.75rem] bg-mist px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-xl'>
            <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>Tư vấn làn da</p>
            <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
              Bạn băn khoăn sản phẩm nào phù hợp với làn da của mình?
            </h2>
            <p className='mt-3 text-sm leading-7 text-muted'>
              Bác sĩ lắng nghe tình trạng da và gợi ý routine đúng, thay vì để bạn đoán giữa các lọ serum.
            </p>
          </div>
          <div className='flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col'>
            <Link
              to='/#dich-vu'
              className='inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-6 py-2.5 text-sm font-semibold text-clinic transition hover:bg-white'
            >
              Xem liệu trình
            </Link>
            <Link
              to='/booking'
              className='inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-clinic px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
            >
              <Icon name='calendar_month' size={18} />
              Đặt lịch tư vấn da
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
