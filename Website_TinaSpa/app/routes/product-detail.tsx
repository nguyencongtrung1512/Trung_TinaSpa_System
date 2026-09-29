import { Link, useParams } from 'react-router'
import { SiteShell } from '~/components/layout/SiteShell'
import { findProduct } from '~/data/products'
import { ProductDetailPage } from '~/features/products/ProductDetailPage'

export function meta({ params }: { params: { productId?: string } }) {
  const product = findProduct(params.productId ?? '')
  if (!product) {
    return [{ title: 'Không tìm thấy sản phẩm — Dr Tina Beauty' }]
  }
  return [
    { title: `${product.name} — Dr Tina Beauty` },
    { name: 'description', content: product.description }
  ]
}

export default function ProductDetail() {
  const { productId } = useParams()
  const product = findProduct(productId ?? '')

  if (!product) {
    return (
      <SiteShell>
        <section className='mx-auto max-w-xl px-4 py-24 text-center'>
          <h1 className='text-3xl font-extrabold text-ink'>Không tìm thấy sản phẩm</h1>
          <p className='mt-3 text-sm leading-7 text-muted'>Sản phẩm này không có trong bộ sưu tập hiện tại.</p>
          <Link
            to='/products'
            className='mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-clinic px-6 text-sm font-semibold text-white'
          >
            Về trang sản phẩm
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
