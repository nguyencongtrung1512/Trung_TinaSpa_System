import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { SiteShell } from '~/components/layout/SiteShell'
import { useProduct } from '~/data/products'
import { ProductDetailPage } from '~/features/products/ProductDetailPage'
import i18n from '~/i18n'

export function meta() {
  return [
    { title: i18n.t('meta.products.title') },
    { name: 'description', content: i18n.t('meta.products.description') }
  ]
}

export default function ProductDetail() {
  const { t } = useTranslation()
  const { productId } = useParams()
  const { product, loading, notFound, error } = useProduct(productId ?? '')

  if (!product) {
    if (loading) {
      return (
        <SiteShell>
          <p className='mx-auto max-w-xl px-4 py-24 text-center text-sm text-muted' role='status'>
            {t('products.list.loading')}
          </p>
        </SiteShell>
      )
    }
    return (
      <SiteShell>
        <section className='mx-auto max-w-xl px-4 py-24 text-center'>
          <h1 className='text-3xl font-extrabold text-ink'>
            {notFound || !error ? t('products.detail.notFoundTitle') : t('products.list.loadError')}
          </h1>
          {notFound || !error ? (
            <p className='mt-3 text-sm leading-7 text-muted'>{t('products.detail.notFoundText')}</p>
          ) : null}
          <Link
            to='/products'
            className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 text-sm font-semibold text-white'
          >
            {t('products.detail.backToProducts')}
          </Link>
        </section>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <ProductDetailPage key={product.id} product={product} />
    </SiteShell>
  )
}
