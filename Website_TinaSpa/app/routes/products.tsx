import { SiteShell } from '~/components/layout/SiteShell'
import { ProductsPage } from '~/features/products/ProductsPage'

export function meta() {
  return [
    { title: 'Sản phẩm — Dr Tina Beauty' },
    {
      name: 'description',
      content:
        'Tinh chất, kem dưỡng, chống nắng và mặt nạ phục hồi được Dr Tina Beauty chọn lọc cho làn da sau liệu trình.'
    }
  ]
}

export default function Products() {
  return (
    <SiteShell>
      <ProductsPage />
    </SiteShell>
  )
}
