import { SiteShell } from '~/components/layout/SiteShell'
import { ProductsPage } from '~/features/products/ProductsPage'
import i18n from '~/i18n'

export function meta() {
  return [
    { title: i18n.t('meta.products.title') },
    { name: 'description', content: i18n.t('meta.products.description') }
  ]
}

export default function Products() {
  return (
    <SiteShell>
      <ProductsPage />
    </SiteShell>
  )
}
