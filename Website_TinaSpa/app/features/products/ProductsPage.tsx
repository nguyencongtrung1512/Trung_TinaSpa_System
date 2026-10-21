import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  formatPrice,
  priceFilters,
  sortOptions,
  useProductCategories,
  useProductList,
  type PriceFilterId,
  type ProductItem,
  type SortId
} from '~/data/products'
import { Icon } from '~/components/ui/Icon'
import { useToast } from '~/components/ui/toast-view'
import { Pagination } from '~/components/ui/Pagination'
import { StableText } from '~/components/ui/StableText'
import { Select } from '~/components/ui/Select'
interface ProductCardProps {
  readonly product: ProductItem
  readonly layout: 'grid' | 'list'
  readonly saved: boolean
  readonly added: boolean
  readonly onToggleSaved: (id: string) => void
  readonly onToggleAdded: (id: string) => void
}

function ProductCard({ product, layout, saved, added, onToggleSaved, onToggleAdded }: ProductCardProps) {
  const { t } = useTranslation()
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
          aria-label={t(saved ? 'products.list.unsave' : 'products.list.save', { name: product.name })}
          onClick={() => onToggleSaved(product.id)}
          className='absolute top-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-clinic shadow-sm transition hover:bg-white'
        >
          <Icon name='favorite' filled={saved} size={20} />
        </button>
      </div>

      <div className='flex flex-1 flex-col p-4 sm:p-5'>
        <p className='text-[11px] font-semibold tracking-[0.14em] text-muted uppercase'>{product.categoryName}</p>
        <h2 className='mt-1 text-base font-extrabold tracking-tight text-ink'>
          <Link to={`/products/${product.id}`} className='transition hover:text-clinic'>
            {product.name}
          </Link>
        </h2>
        <p className='mt-0.5 text-xs font-medium text-muted'>{product.subtitle}</p>
        <p className={`mt-2 text-sm leading-6 text-muted ${isList ? '' : 'line-clamp-2'}`}>{product.description}</p>

        <div className='mt-auto flex items-center justify-between gap-3 pt-4'>
          <p className='text-lg font-extrabold text-clinic'>
            <span className='sr-only'>{t('products.list.price')}</span>
            {product.variants.length > 1 ? (
              <span className='mr-1 text-xs font-semibold text-muted'>{t('products.list.from')}</span>
            ) : null}
            {formatPrice(product.price)}
          </p>
          <button
            type='button'
            aria-pressed={added}
            aria-label={t(added ? 'products.list.removeFromCart' : 'products.list.addToCart', { name: product.name })}
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

const PAGE_SIZE = 9

function toggleId(current: ReadonlySet<string>, id: string) {
  const next = new Set(current)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

export function ProductsPage() {
  const { t } = useTranslation()
  const categories = useProductCategories().data
  const [categoryID, setCategoryID] = useState('all')
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortId>('newest')
  const [price, setPrice] = useState<PriceFilterId>('all')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set())
  const [addedIds, setAddedIds] = useState<ReadonlySet<string>>(new Set())
  const toast = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, loading, error, reload } = useProductList({
    categoryID: categoryID === 'all' ? undefined : categoryID,
    search: debouncedQuery,
    price,
    sort,
    page,
    pageSize: PAGE_SIZE
  })
  const visible = data.items

  function resetFilters() {
    setCategoryID('all')
    setQuery('')
    setDebouncedQuery('')
    setSort('newest')
    setPrice('all')
    setPage(1)
  }

  function changePage(next: number) {
    setPage(next)
    document.getElementById('product-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onToggleAdded(id: string) {
    const product = visible.find((item) => item.id === id)
    const willAdd = !addedIds.has(id)
    setAddedIds((current) => toggleId(current, id))
    if (product) toast.success(t(willAdd ? 'products.list.added' : 'products.list.removed', { name: product.name }))
  }

  return (
    <div className='bg-canvas'>
      <section className='mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14'>
        <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>
          <StableText i18nKey='products.list.eyebrow' block />
        </p>
        <h1 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
          <StableText i18nKey='products.list.title' block />
        </h1>
        <p className='mt-3 max-w-2xl text-sm leading-7 text-muted'>
          <StableText i18nKey='products.list.description' block />
        </p>

        <div
          className='mt-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          role='group'
          aria-label={t('products.list.groups')}
        >
          {[{ id: 'all', name: t('products.categories.all') }, ...categories].map((item) => {
            const active = categoryID === item.id
            return (
              <button
                key={item.id}
                type='button'
                aria-pressed={active}
                onClick={() => {
                  setCategoryID(item.id)
                  setPage(1)
                }}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-clinic text-white shadow-[0_8px_20px_var(--color-whisper-shadow)]'
                    : 'border border-rose-soft bg-surface text-ink hover:border-clinic hover:text-clinic'
                }`}
              >
                {item.name}
              </button>
            )
          })}
        </div>

        <div className='mt-5 flex flex-col gap-3 rounded-[1.35rem] bg-surface p-3 shadow-[0_8px_24px_var(--color-whisper-shadow)] lg:flex-row lg:items-center'>
          <label className='relative min-w-0 flex-1'>
            <span className='sr-only'>{t('products.list.search')}</span>
            <Icon
              name='search'
              size={20}
              className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted'
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('products.list.searchPlaceholder')}
              className='h-11 w-full rounded-full border border-rose-soft bg-canvas pr-4 pl-11 text-sm text-ink outline-none placeholder:text-muted focus:border-clinic focus:ring-2 focus:ring-clinic/20'
            />
          </label>

          <label className='flex h-11 items-center gap-2 rounded-full border border-rose-soft bg-canvas px-4 text-sm'>
            <StableText i18nKey='products.list.sortLabel' align='start' className='shrink-0 font-semibold text-muted' />
            <Select
              variant='bare'
              className='w-40 font-semibold'
              value={sort}
              aria-label={t('products.list.sortAria')}
              onChange={(value) => {
                setSort(value)
                setPage(1)
              }}
              options={sortOptions.map((item) => ({ value: item, label: t(`products.sort.${item}`) }))}
            />
          </label>

          <label className='flex h-11 items-center gap-2 rounded-full border border-rose-soft bg-canvas px-4 text-sm'>
            <StableText
              i18nKey='products.list.priceLabel'
              align='start'
              className='shrink-0 font-semibold text-muted'
            />
            <Select
              variant='bare'
              className='w-44 font-semibold'
              value={price}
              aria-label={t('products.list.priceAria')}
              onChange={(value) => {
                setPrice(value)
                setPage(1)
              }}
              options={priceFilters.map((item) => ({ value: item, label: t(`products.priceFilters.${item}`) }))}
            />
          </label>

          <div className='flex items-center justify-end gap-1' role='group' aria-label={t('products.list.layout')}>
            <button
              type='button'
              aria-pressed={layout === 'grid'}
              aria-label={t('products.list.grid')}
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
              aria-label={t('products.list.listView')}
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
          {t('products.list.count', { count: data.total })}
          {addedIds.size > 0 ? t('products.list.inCart', { count: addedIds.size }) : ''}
          {savedIds.size > 0 ? t('products.list.saved', { count: savedIds.size }) : ''}
        </p>

        <div id='product-results' className='scroll-mt-24' />

        {error ? (
          <div className='mt-6 rounded-[1.5rem] bg-surface px-6 py-16 text-center shadow-[0_12px_32px_var(--color-whisper-shadow)]'>
            <p className='text-sm text-muted'>{t('products.list.loadError')}</p>
            <button
              type='button'
              onClick={reload}
              className='mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 py-2.5 text-sm font-semibold text-white'
            >
              {t('products.list.retry')}
            </button>
          </div>
        ) : loading && visible.length === 0 ? (
          <p className='mt-6 rounded-[1.5rem] bg-surface px-6 py-16 text-center text-sm text-muted' role='status'>
            {t('products.list.loading')}
          </p>
        ) : visible.length === 0 ? (
          <div className='mt-6 rounded-[1.5rem] bg-surface px-6 py-16 text-center shadow-[0_12px_32px_var(--color-whisper-shadow)]'>
            <span className='mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-mist text-clinic'>
              <Icon name='search_off' size={32} />
            </span>
            <h2 className='mt-4 text-xl font-extrabold text-ink'>{t('products.list.emptyTitle')}</h2>
            <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-muted'>{t('products.list.emptyText')}</p>
            <button
              type='button'
              onClick={resetFilters}
              className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 py-2.5 text-sm font-semibold text-white'
            >
              <StableText i18nKey='products.list.showAll' />
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

        {error ? null : (
          <Pagination
            className='mt-8'
            variant='site'
            page={page}
            pageSize={data.pageSize}
            total={data.total}
            disabled={loading}
            onPageChange={changePage}
            labels={{
              navigation: t('products.list.pagination.navigation'),
              previous: t('products.list.pagination.previous'),
              next: t('products.list.pagination.next'),
              page: (value) => t('products.list.pagination.page', { page: value }),
              summary: (range) => t('products.list.pagination.summary', range)
            }}
          />
        )}
      </section>

      <section className='px-4 pb-16 sm:px-6'>
        <div className='mx-auto flex max-w-6xl flex-col gap-8 rounded-[1.75rem] bg-mist px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-xl'>
            <p className='text-xs font-bold tracking-[0.28em] text-clinic uppercase'>
              {t('products.list.adviceEyebrow')}
            </p>
            <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
              {t('products.list.adviceTitle')}
            </h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{t('products.list.adviceText')}</p>
          </div>
          <div className='flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col'>
            <Link
              to='/services'
              className='inline-flex min-h-11 items-center justify-center rounded-full border border-clinic px-6 py-2.5 text-sm font-semibold text-clinic transition hover:bg-white'
            >
              <StableText i18nKey='products.list.viewTreatments' />
            </Link>
            <Link
              to='/booking'
              className='inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-clinic px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
            >
              <Icon name='calendar_month' size={18} />
              <StableText i18nKey='products.list.bookSkinConsult' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
