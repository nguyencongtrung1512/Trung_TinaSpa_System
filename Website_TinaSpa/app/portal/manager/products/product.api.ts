import { apiRequest } from '~/lib/api'

export type ProductStatus = 'ACTIVE' | 'INACTIVE'

export type ProductDetailType = 'STORY' | 'HIGHLIGHT' | 'EFFECT' | 'INGREDIENT' | 'USAGE' | 'NOTE' | 'GALLERY'

export const detailTypeMeta: Record<ProductDetailType, { readonly label: string; readonly hint: string }> = {
  STORY: { label: 'Câu chuyện', hint: 'Đoạn giới thiệu sản phẩm.' },
  HIGHLIGHT: { label: 'Điểm nổi bật', hint: 'Một ý nổi bật mỗi dòng.' },
  EFFECT: { label: 'Hiệu quả', hint: 'Tiêu đề + mô tả, kèm icon Material Symbols.' },
  INGREDIENT: { label: 'Thành phần', hint: 'Tên thành phần.' },
  USAGE: { label: 'Cách dùng', hint: 'Mỗi dòng là một bước.' },
  NOTE: { label: 'Lưu ý', hint: 'Cảnh báo, bảo quản.' },
  GALLERY: { label: 'Thư viện ảnh', hint: 'Ảnh phụ của sản phẩm.' }
}

export const detailTypes = Object.keys(detailTypeMeta) as ProductDetailType[]

export interface ProductCategory {
  readonly productCategoryID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly description: string | null
  readonly displayOrder: number
  readonly isActive: boolean
  readonly productCount: number
  readonly note?: string | null
}

export type ProductCategoryPayload = Omit<ProductCategory, 'productCategoryID' | 'productCount'>

export interface ProductDetail {
  readonly detailType: ProductDetailType
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly contentVietnamese: string | null
  readonly contentEnglish: string | null
  readonly contentCambodia: string | null
  readonly icon: string | null
  readonly image: string | null
  readonly imageAlt: string | null
  readonly sortOrder: number
}

export interface ProductVariantImage {
  readonly image: string
  readonly altVietnamese: string | null
  readonly altEnglish: string | null
}

export interface ProductVariant {
  /** Absent only on rows that have not been saved yet. */
  readonly productVariantID: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly sku: string | null
  readonly price: number
  readonly compareAtPrice: number | null
  readonly images: ProductVariantImage[]
  readonly status: ProductStatus
  readonly sortOrder: number
}

export type ProductVariantPayload = Omit<ProductVariant, 'productVariantID'> & { readonly productVariantID?: string }

export interface Product {
  readonly productID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly subtitleVietnamese: string | null
  readonly subtitleEnglish: string | null
  readonly subtitleCambodia: string | null
  readonly descriptionVietnamese: string | null
  readonly descriptionEnglish: string | null
  readonly descriptionCambodia: string | null
  /** "From" price: the cheapest active variant. Maintained by the API. */
  readonly price: number
  readonly compareAtPrice: number | null
  readonly image: string | null
  readonly imageAlt: string | null
  readonly badge: string | null
  readonly status: ProductStatus
  readonly variants: ProductVariant[]
  readonly category: {
    readonly productCategoryID: string
    readonly slug: string
    readonly nameVietnamese: string
  }
  /** Only returned by the single-product endpoint. */
  readonly details?: ProductDetail[]
  readonly note?: string | null
}

export interface ProductPayload {
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly slug: string
  readonly productCategoryID: string
  readonly subtitleVietnamese: string | null
  readonly subtitleEnglish: string | null
  readonly subtitleCambodia: string | null
  readonly descriptionVietnamese: string | null
  readonly descriptionEnglish: string | null
  readonly descriptionCambodia: string | null
  readonly image: string | null
  readonly imageAlt: string | null
  readonly badge: string | null
  readonly status: ProductStatus
  readonly note: string | null
  readonly variants: ProductVariantPayload[]
  readonly details?: ProductDetail[]
}

export interface ProductPage {
  readonly items: Product[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

export interface ProductQuery {
  readonly categoryID?: string
  readonly status?: ProductStatus
  readonly search?: string
  readonly page?: number
  readonly pageSize?: number
}

export const productApi = {
  listCategories: () => apiRequest<ProductCategory[]>('/product-categories/manage', { auth: true }),
  createCategory: (body: ProductCategoryPayload) =>
    apiRequest<ProductCategory>('/product-categories', { method: 'POST', body, auth: true }),
  updateCategory: (id: string, body: Partial<ProductCategoryPayload>) =>
    apiRequest<ProductCategory>(`/product-categories/${id}`, { method: 'PATCH', body, auth: true }),
  removeCategory: (id: string) => apiRequest<void>(`/product-categories/${id}`, { method: 'DELETE', auth: true }),

  listProducts: (query: ProductQuery) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value))
    }
    const search = params.toString()
    return apiRequest<ProductPage>(`/products/manage${search ? `?${search}` : ''}`, { auth: true })
  },
  getProduct: (id: string) => apiRequest<Product>(`/products/manage/${id}`, { auth: true }),
  createProduct: (body: ProductPayload) => apiRequest<Product>('/products', { method: 'POST', body, auth: true }),
  updateProduct: (id: string, body: Partial<ProductPayload>) =>
    apiRequest<Product>(`/products/${id}`, { method: 'PATCH', body, auth: true }),
  removeProduct: (id: string) => apiRequest<void>(`/products/${id}`, { method: 'DELETE', auth: true })
}
