import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { SiteShell } from '~/components/layout/SiteShell'
import { findProduct, useProduct } from '~/data/products'
import { ProductDetailPage } from '~/features/products/ProductDetailPage'
import i18n from '~/i18n'

export function meta({ params }: { params: { productId?: string } }) {
  const product = findProduct(params.productId ?? '')
  if (!product) {
    return [{ title: i18n.t('meta.productNotFound') }]
  }
  return [
    { title: `${product.name} — Dr Tina Beauty` },
    { name: 'description', content: product.description }
  ]
}

export default function ProductDetail() {
  const { t } = useTranslation()
  const { productId } = useParams()
  const product = useProduct(productId ?? '')

  if (!product) {
    return (
      <SiteShell>
        <section className='mx-auto max-w-xl px-4 py-24 text-center'>
          <h1 className='text-3xl font-extrabold text-ink'>{t('products.detail.notFoundTitle')}</h1>
          <p className='mt-3 text-sm leading-7 text-muted'>{t('products.detail.notFoundText')}</p>
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
