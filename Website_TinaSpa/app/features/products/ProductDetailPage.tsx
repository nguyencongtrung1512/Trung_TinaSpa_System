import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { formatPrice, useRelatedProducts, type ProductItem } from '~/data/products'
import { Icon } from '~/components/ui/Icon'
import { StableText } from '~/components/ui/StableText'

const tabs = ['story', 'ingredients', 'usage', 'notes'] as const

type TabId = (typeof tabs)[number]

const trustPoints = ['verified', 'spa', 'favorite'] as const

export interface ProductDetailPageProps {
  readonly product: ProductItem
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const { t } = useTranslation()
  const [shot, setShot] = useState(0)
  const [qty, setQty] = useState(1)
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '')
  const [tab, setTab] = useState<TabId>('story')
  const [notice, setNotice] = useState('')
  const companions = useRelatedProducts(product)
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0]
  const gallery = variant.gallery.length > 0 ? variant.gallery : product.gallery
  const activeShot = gallery[shot] ?? gallery[0]
  const cartName = product.variants.length > 1 ? `${product.name} (${variant.name})` : product.name

  function changeQty(next: number) {
    setQty(Math.min(10, Math.max(1, next)))
    setNotice('')
  }

  return (
    <div className='bg-canvas'>
      <section className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12'>
        <nav aria-label={t('products.detail.breadcrumb')} className='flex flex-wrap items-center gap-2 text-sm text-muted'>
          <Link to='/' className='transition hover:text-clinic'>
            <StableText i18nKey='nav.home' align='start' />
          </Link>
          <span aria-hidden>/</span>
          <Link to='/products' className='transition hover:text-clinic'>
            <StableText i18nKey='nav.products' align='start' />
          </Link>
          <span aria-hidden>/</span>
          <span className='font-semibold text-ink'>{product.name}</span>
        </nav>

        <div className='mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12'>
          <div>
            <div className='overflow-hidden rounded-[1.5rem] bg-surface p-3 shadow-[0_16px_40px_var(--color-whisper-shadow)]'>
              {activeShot ? (
                <img
                  src={activeShot.src}
                  alt={activeShot.alt}
                  className='aspect-[4/5] w-full rounded-[1.15rem] object-cover sm:aspect-[5/4]'
                />
              ) : (
                <div className='aspect-[4/5] w-full rounded-[1.15rem] bg-mist sm:aspect-[5/4]' />
              )}
            </div>
            <div className='mt-4 grid grid-cols-4 gap-3' role='group' aria-label={t('products.detail.gallery')}>
              {gallery.map((item, index) => {
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
              {product.categoryName}
            </p>
            <h1 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>{product.name}</h1>
            <p className='mt-2 text-sm font-semibold text-muted'>{product.subtitle}</p>
            <p className='mt-4 text-sm leading-7 text-muted'>{product.description}</p>

            <div className='mt-6 flex flex-wrap items-end gap-3'>
              <p className='text-3xl font-extrabold text-clinic'>{formatPrice(variant.price)}</p>
              {variant.compareAt ? (
                <p className='pb-1 text-sm text-muted line-through'>{formatPrice(variant.compareAt)}</p>
              ) : null}
              <p className='pb-1 text-sm font-semibold text-clinic'>
                <StableText i18nKey='products.detail.inStock' align='start' />
              </p>
            </div>
            {product.variants.length > 1 ? (
              <div className='mt-5' role='radiogroup' aria-label={t('products.detail.variants')}>
                <p className='text-xs font-bold tracking-[0.14em] text-muted uppercase'>{t('products.detail.variants')}</p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {product.variants.map((item) => {
                    const selected = item.id === variant.id
                    return (
                      <button
                        key={item.id}
                        type='button'
                        role='radio'
                        aria-checked={selected}
                        onClick={() => {
                          setVariantId(item.id)
                          setShot(0)
                          setNotice('')
                        }}
                        className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          selected
                            ? 'border-clinic bg-clinic text-white'
                            : 'border-rose-soft bg-surface text-ink hover:border-clinic hover:text-clinic'
                        }`}
                      >
                        {item.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className='mt-6 flex items-center gap-3'>
              <div className='inline-flex items-center rounded-full border border-rose-soft bg-surface'>
                <button
                  type='button'
                  aria-label={t('products.detail.decrease')}
                  onClick={() => changeQty(qty - 1)}
                  className='inline-flex h-11 w-11 items-center justify-center text-ink'
                >
                  <Icon name='remove' size={18} />
                </button>
                <span className='min-w-8 text-center text-sm font-extrabold text-ink' aria-live='polite'>
                  <span className='sr-only'>{t('products.detail.quantity')}</span>
                  {qty}
                </span>
                <button
                  type='button'
                  aria-label={t('products.detail.increase')}
                  onClick={() => changeQty(qty + 1)}
                  className='inline-flex h-11 w-11 items-center justify-center text-ink'
                >
                  <Icon name='add' size={18} />
                </button>
              </div>
            </div>

            <button
              type='button'
              onClick={() => setNotice(t('products.detail.added', { qty, name: cartName }))}
              className='mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-clinic px-6 text-sm font-semibold text-white shadow-[0_12px_28px_var(--color-whisper-shadow)] transition hover:bg-clinic-deep'
            >
              <Icon name='shopping_bag' size={18} />
              {t('products.detail.addToCart')}
            </button>
            <p className='sr-only' aria-live='polite'>
              {notice}
            </p>
            {notice ? <p className='mt-3 text-sm font-semibold text-clinic'>{notice}</p> : null}

            <ul className='mt-8 grid grid-cols-3 gap-3'>
              {trustPoints.map((icon) => (
                <li key={icon} className='text-center'>
                  <span className='mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-mist text-clinic'>
                    <Icon name={icon} size={22} />
                  </span>
                  <span className='mt-2 block text-xs font-semibold text-ink'>{t(`products.detail.trust.${icon}`)}</span>
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
          aria-label={t('products.detail.info')}
        >
          {tabs.map((item) => {
            const selected = tab === item
            return (
              <button
                key={item}
                type='button'
                role='tab'
                id={`product-tab-${item}`}
                aria-selected={selected}
                aria-controls={`product-panel-${item}`}
                onClick={() => setTab(item)}
                className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  selected ? 'border-clinic text-clinic' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                <StableText i18nKey={`products.detail.tabs.${item}`} />
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
                <h2 className='text-lg font-extrabold text-ink'>{t('products.detail.whyTitle')}</h2>
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
                <h2 className='text-lg font-extrabold text-ink'>{t('products.detail.ingredientsTitle')}</h2>
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
                <h2 className='text-lg font-extrabold text-ink'>{t('products.detail.usageTitle')}</h2>
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
                <h2 className='text-lg font-extrabold text-ink'>{t('products.detail.notesTitle')}</h2>
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
            <h2 className='text-lg font-extrabold text-ink'>{t('products.detail.effectsTitle')}</h2>
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
            {t('products.detail.relatedTitle')}
          </h2>
          <Link to='/products' className='shrink-0 text-sm font-semibold text-clinic hover:text-clinic-deep'>
            <StableText i18nKey='common.viewAll' align='end' />
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
