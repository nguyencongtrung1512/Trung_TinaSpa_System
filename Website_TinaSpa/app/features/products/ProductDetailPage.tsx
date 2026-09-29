import { useState } from 'react'
import { Link } from 'react-router'
import {
  categoryLabel,
  formatPrice,
  relatedProducts,
  type ProductItem
} from '~/data/products'
import { Icon } from '~/components/ui/Icon'

const tabs = [
  { id: 'story', label: 'Mô tả' },
  { id: 'ingredients', label: 'Thành phần' },
  { id: 'usage', label: 'Cách dùng' },
  { id: 'notes', label: 'Lưu ý' }
] as const

type TabId = (typeof tabs)[number]['id']

const trustPoints = [
  { icon: 'verified', label: 'Đã kiểm nghiệm' },
  { icon: 'spa', label: 'Thành phần dịu' },
  { icon: 'favorite', label: 'Da nhạy cảm' }
] as const

function formatRating(value: number) {
  return value.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

function Stars({ rating }: { readonly rating: number }) {
  return (
    <span className='inline-flex items-center text-clinic' aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = rating >= index + 1
        const half = !filled && rating > index
        return <Icon key={index} name={half ? 'star_half' : 'star'} filled={filled || half} size={18} />
      })}
    </span>
  )
}

export interface ProductDetailPageProps {
  readonly product: ProductItem
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [shot, setShot] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<TabId>('story')
  const [notice, setNotice] = useState('')
  const activeShot = product.gallery[shot] ?? product.gallery[0]
  const companions = relatedProducts(product.id)

  function changeQty(next: number) {
    setQty(Math.min(10, Math.max(1, next)))
    setNotice('')
  }

  return (
    <div className='bg-canvas'>
      <section className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12'>
        <nav aria-label='Đường dẫn' className='flex flex-wrap items-center gap-2 text-sm text-muted'>
          <Link to='/' className='transition hover:text-clinic'>
            Trang chủ
          </Link>
          <span aria-hidden>/</span>
          <Link to='/products' className='transition hover:text-clinic'>
            Sản phẩm
          </Link>
          <span aria-hidden>/</span>
          <span className='font-semibold text-ink'>{product.name}</span>
        </nav>

        <div className='mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12'>
          <div>
            <div className='overflow-hidden rounded-[1.5rem] bg-surface p-3 shadow-[0_16px_40px_var(--color-whisper-shadow)]'>
              <img
                src={activeShot.src}
                alt={activeShot.alt}
                className='aspect-[4/5] w-full rounded-[1.15rem] object-cover sm:aspect-[5/4]'
              />
            </div>
            <div className='mt-4 grid grid-cols-4 gap-3' role='group' aria-label='Ảnh sản phẩm'>
              {product.gallery.map((item, index) => {
                const selected = index === shot
                return (
                  <button
                    key={item.src}
                    type='button'
                    aria-pressed={selected}
                    aria-label={item.alt}
                    onClick={() => setShot(index)}
                    className={`overflow-hidden rounded-2xl border-2 bg-surface transition ${
                      selected ? 'border-clinic' : 'border-transparent hover:border-rose-soft'
                    }`}
                  >
                    <img src={item.src} alt='' className='aspect-square w-full object-cover' />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className='text-xs font-bold tracking-[0.22em] text-clinic uppercase'>
              {categoryLabel(product.category)}
            </p>
            <h1 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>{product.name}</h1>
            <p className='mt-2 text-sm font-semibold text-muted'>{product.subtitle}</p>
            <p className='mt-3 flex items-center gap-2 text-sm text-muted'>
              <Stars rating={product.rating} />
              <span>
                <span className='sr-only'>Đánh giá </span>
                {formatRating(product.rating)} ({product.reviews} nhận xét)
              </span>
            </p>
            <p className='mt-4 text-sm leading-7 text-muted'>{product.description}</p>

            <div className='mt-6 flex flex-wrap items-end gap-3'>
              <p className='text-3xl font-extrabold text-clinic'>{formatPrice(product.price)}</p>
              {product.compareAt ? (
                <p className='pb-1 text-sm text-muted line-through'>{formatPrice(product.compareAt)}</p>
              ) : null}
              <p className='pb-1 text-sm font-semibold text-clinic'>Còn hàng</p>
            </div>
            <p className='mt-1 text-xs text-muted'>Dung tích {product.volume} · Dùng sau liệu trình tại phòng khám</p>

            <div className='mt-6 flex items-center gap-3'>
              <div className='inline-flex items-center rounded-full border border-rose-soft bg-surface'>
                <button
                  type='button'
                  aria-label='Giảm số lượng'
                  onClick={() => changeQty(qty - 1)}
                  className='inline-flex h-11 w-11 items-center justify-center text-ink'
                >
                  <Icon name='remove' size={18} />
                </button>
                <span className='min-w-8 text-center text-sm font-extrabold text-ink' aria-live='polite'>
                  <span className='sr-only'>Số lượng </span>
                  {qty}
                </span>
                <button
                  type='button'
                  aria-label='Tăng số lượng'
                  onClick={() => changeQty(qty + 1)}
                  className='inline-flex h-11 w-11 items-center justify-center text-ink'
                >
                  <Icon name='add' size={18} />
                </button>
              </div>
            </div>

            <button
              type='button'
              onClick={() => setNotice(`Đã thêm ${qty} ${product.name} vào giỏ.`)}
              className='mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clinic px-6 text-sm font-semibold text-white shadow-[0_12px_28px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
            >
              <Icon name='shopping_bag' size={18} />
              Thêm vào giỏ hàng
            </button>
            <p className='sr-only' aria-live='polite'>
              {notice}
            </p>
            {notice ? <p className='mt-3 text-sm font-semibold text-clinic'>{notice}</p> : null}

            <ul className='mt-8 grid grid-cols-3 gap-3'>
              {trustPoints.map((item) => (
                <li key={item.icon} className='text-center'>
                  <span className='mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-mist text-clinic'>
                    <Icon name={item.icon} size={22} />
                  </span>
                  <span className='mt-2 block text-xs font-semibold text-ink'>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 pb-6 sm:px-6'>
        <div
          className='flex gap-2 overflow-x-auto border-b border-rose-soft/80'
          role='tablist'
          aria-label='Thông tin sản phẩm'
        >
          {tabs.map((item) => {
            const selected = tab === item.id
            return (
              <button
                key={item.id}
                type='button'
                role='tab'
                id={`product-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`product-panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  selected ? 'border-clinic text-clinic' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]'>
          <div
            role='tabpanel'
            id={`product-panel-${tab}`}
            aria-labelledby={`product-tab-${tab}`}
            className='rounded-[1.5rem] bg-surface p-6 shadow-[0_12px_32px_var(--color-whisper-shadow)] sm:p-8'
          >
            {tab === 'story' ? (
              <div>
                <h2 className='text-lg font-extrabold text-ink'>Vì sao phòng khám chọn sản phẩm này</h2>
                {product.story.map((paragraph) => (
                  <p key={paragraph} className='mt-3 text-sm leading-7 text-muted'>
                    {paragraph}
                  </p>
                ))}
                <ul className='mt-5 space-y-3'>
                  {product.highlights.map((item) => (
                    <li key={item} className='flex items-start gap-3 text-sm leading-6 text-ink'>
                      <Icon name='check_circle' size={18} className='mt-0.5 shrink-0 text-clinic' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tab === 'ingredients' ? (
              <div>
                <h2 className='text-lg font-extrabold text-ink'>Thành phần nổi bật</h2>
                <ul className='mt-4 space-y-3'>
                  {product.ingredients.map((item) => (
                    <li key={item} className='flex items-start gap-3 text-sm leading-6 text-ink'>
                      <Icon name='spa' size={18} className='mt-0.5 shrink-0 text-clinic' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {tab === 'usage' ? (
              <div>
                <h2 className='text-lg font-extrabold text-ink'>Cách dùng tại nhà</h2>
                <ol className='mt-4 space-y-4'>
                  {product.usage.map((item, index) => (
                    <li key={item} className='flex items-start gap-3 text-sm leading-6 text-ink'>
                      <span className='inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-extrabold text-clinic'>
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {tab === 'notes' ? (
              <div>
                <h2 className='text-lg font-extrabold text-ink'>Lưu ý khi dùng</h2>
                <ul className='mt-4 space-y-3'>
                  {product.notes.map((item) => (
                    <li key={item} className='flex items-start gap-3 text-sm leading-6 text-ink'>
                      <Icon name='info' size={18} className='mt-0.5 shrink-0 text-clinic' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className='rounded-[1.5rem] bg-mist p-6 sm:p-8'>
            <h2 className='text-lg font-extrabold text-ink'>Công dụng chính</h2>
            <ul className='mt-5 space-y-4'>
              {product.effects.map((item) => (
                <li key={item.title} className='rounded-2xl bg-surface px-4 py-4'>
                  <p className='flex items-center gap-2 font-extrabold text-ink'>
                    <Icon name={item.icon} size={20} className='text-clinic' />
                    {item.title}
                  </p>
                  <p className='mt-1 text-sm leading-6 text-muted'>{item.text}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className='mx-auto max-w-6xl px-4 py-12 sm:px-6'>
        <div className='flex items-end justify-between gap-4'>
          <h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>
            Liệu trình chăm sóc kết hợp
          </h2>
          <Link to='/products' className='shrink-0 text-sm font-semibold text-clinic hover:text-clinic-deep'>
            Xem tất cả
          </Link>
        </div>
        <div className='mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {companions.map((item) => (
            <Link
              key={item.id}
              to={`/products/${item.id}`}
              className='group overflow-hidden rounded-[1.35rem] bg-surface shadow-[0_12px_32px_var(--color-whisper-shadow)] transition hover:-translate-y-1'
            >
              <div className='relative'>
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className='aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]'
                />
                <span className='absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-clinic uppercase'>
                  {item.badge}
                </span>
              </div>
              <div className='p-4'>
                <h3 className='font-extrabold text-ink'>{item.name}</h3>
                <p className='mt-1 text-xs text-muted'>{item.subtitle}</p>
                <p className='mt-3 text-lg font-extrabold text-clinic'>{formatPrice(item.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
