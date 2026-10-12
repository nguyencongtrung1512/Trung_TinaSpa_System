import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiRequest } from '~/lib/api'

export const sortOptions = ['newest', 'price-asc', 'price-desc'] as const

export const priceFilters = ['all', 'under-500', '500-700', 'over-700'] as const

export type SortId = (typeof sortOptions)[number]
export type PriceFilterId = (typeof priceFilters)[number]

export interface ProductShot {
  readonly src: string
  readonly alt: string
}

export interface ProductEffect {
  readonly icon: string
  readonly title: string
  readonly text: string
}

export interface ProductVariantItem {
  readonly id: string
  readonly name: string
  /** Variant gallery; empty means the product gallery is shown. */
  readonly gallery: readonly ProductShot[]
  readonly price: number
  readonly compareAt: number | null
}

export interface ProductItem {
  /** Public slug; used in the `/products/:slug` URL. */
  readonly id: string
  readonly name: string
  readonly subtitle: string
  readonly description: string
  /** "From" price: the cheapest variant. */
  readonly price: number
  readonly compareAt: number | null
  readonly variants: readonly ProductVariantItem[]
  readonly image: string
  readonly imageAlt: string
  readonly categoryID: string
  readonly categoryName: string
  readonly badge: string
  readonly createdAt: string
  readonly story: readonly string[]
  readonly highlights: readonly string[]
  readonly effects: readonly ProductEffect[]
  readonly ingredients: readonly string[]
  readonly usage: readonly string[]
  readonly notes: readonly string[]
  readonly gallery: readonly ProductShot[]
}

export interface ProductCategoryItem {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly productCount: number
}

interface ApiCategory {
  readonly productCategoryID: string
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly nameCambodia: string | null
  readonly productCount: number
}

interface ApiDetail {
  readonly detailType: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly contentVietnamese: string | null
  readonly contentEnglish: string | null
  readonly icon: string | null
  readonly image: string | null
  readonly imageAlt: string | null
  readonly sortOrder: number
}

interface ApiVariant {
  readonly productVariantID: string
  readonly images?: { readonly image: string; readonly altVietnamese: string; readonly altEnglish: string | null }[]
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly price: number
  readonly compareAtPrice: number | null
}

interface ApiProduct {
  readonly slug: string
  readonly nameVietnamese: string
  readonly nameEnglish: string | null
  readonly subtitleVietnamese: string | null
  readonly subtitleEnglish: string | null
  readonly descriptionVietnamese: string | null
  readonly descriptionEnglish: string | null
  readonly price: number
  readonly compareAtPrice: number | null
  readonly image: string | null
  readonly imageAlt: string | null
  readonly badge: string | null
  readonly createdAt: string
  readonly category: ApiCategory
  readonly variants?: ApiVariant[]
  readonly details?: ApiDetail[]
}

interface ApiProductPage {
  readonly items: ApiProduct[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

const isEnglish = (language: string | undefined) => language?.startsWith('en') === true

/** Picks the field for the current language, falling back to Vietnamese (always filled). */
function pick(language: string | undefined, vietnamese: string | null, english: string | null) {
  return (isEnglish(language) ? english || vietnamese : vietnamese || english) ?? ''
}

function toCategory(category: ApiCategory, language: string | undefined): ProductCategoryItem {
  return {
    id: category.productCategoryID,
    slug: category.slug,
    name: pick(language, category.nameVietnamese, category.nameEnglish),
    productCount: category.productCount
  }
}

function toProduct(product: ApiProduct, language: string | undefined): ProductItem {
  const details = [...(product.details ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const texts = (type: string) =>
    details
      .filter((detail) => detail.detailType === type)
      .map((detail) => pick(language, detail.contentVietnamese, detail.contentEnglish))
      .filter(Boolean)
  const gallery = details
    .filter((detail) => detail.detailType === 'GALLERY' && detail.image)
    .map((detail) => ({ src: detail.image ?? '', alt: detail.imageAlt || product.nameVietnamese }))
  const name = pick(language, product.nameVietnamese, product.nameEnglish)
  const image = product.image ?? gallery[0]?.src ?? ''

  return {
    id: product.slug,
    name,
    subtitle: pick(language, product.subtitleVietnamese, product.subtitleEnglish),
    description: pick(language, product.descriptionVietnamese, product.descriptionEnglish),
    price: product.price,
    compareAt: product.compareAtPrice,
    variants:
      product.variants && product.variants.length > 0
        ? product.variants.map((variant) => ({
            id: variant.productVariantID,
            name: pick(language, variant.nameVietnamese, variant.nameEnglish),
            gallery: (variant.images ?? []).map((item) => ({
              src: item.image,
              alt: pick(language, item.altVietnamese, item.altEnglish) || name
            })),
            price: variant.price,
            compareAt: variant.compareAtPrice
          }))
        : [{ id: product.slug, name, gallery: [], price: product.price, compareAt: product.compareAtPrice }],
    image,
    imageAlt: product.imageAlt || name,
    categoryID: product.category.productCategoryID,
    categoryName: pick(language, product.category.nameVietnamese, product.category.nameEnglish),
    badge: product.badge ?? '',
    createdAt: product.createdAt,
    story: texts('STORY'),
    highlights: texts('HIGHLIGHT'),
    effects: details
      .filter((detail) => detail.detailType === 'EFFECT')
      .map((detail) => ({
        icon: detail.icon || 'spa',
        title: pick(language, detail.nameVietnamese, detail.nameEnglish),
        text: pick(language, detail.contentVietnamese, detail.contentEnglish)
      })),
    ingredients: texts('INGREDIENT'),
    usage: texts('USAGE'),
    notes: texts('NOTE'),
    gallery: gallery.length > 0 ? gallery : image ? [{ src: image, alt: product.imageAlt || name }] : []
  }
}

export interface ProductQuery {
  readonly categoryID?: string
  readonly search?: string
  readonly price?: PriceFilterId
  readonly sort?: SortId
  readonly page?: number
  readonly pageSize?: number
}

function queryString(query: ProductQuery) {
  const params = new URLSearchParams()
  if (query.categoryID) params.set('categoryID', query.categoryID)
  if (query.search) params.set('search', query.search)
  if (query.sort) params.set('sort', query.sort)
  if (query.price === 'under-500') params.set('maxPrice', '499999')
  if (query.price === '500-700') {
    params.set('minPrice', '500000')
    params.set('maxPrice', '700000')
  }
  if (query.price === 'over-700') params.set('minPrice', '700001')
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))
  const text = params.toString()
  return text ? `?${text}` : ''
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed'
}

export interface AsyncState<T> {
  readonly data: T
  readonly loading: boolean
  readonly error?: string
}

export interface ProductListState extends AsyncState<ProductListData> {
  readonly reload: () => void
}

export interface ProductListData {
  readonly items: readonly ProductItem[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
}

const emptyList: ProductListData = { items: [], total: 0, page: 1, pageSize: 12 }

export function useProductCategories(): AsyncState<readonly ProductCategoryItem[]> {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const [raw, setRaw] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let cancelled = false
    apiRequest<ApiCategory[]>('/product-categories')
      .then((next) => !cancelled && setRaw(next))
      .catch((failure: unknown) => !cancelled && setError(errorMessage(failure)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const data = useMemo(() => raw.map((category) => toCategory(category, language)), [raw, language])
  return { data, loading, error }
}

/** One page of products from the API; refetches when the query changes. */
export function useProductList(query: ProductQuery): ProductListState {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const [raw, setRaw] = useState<ApiProductPage>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [reloadKey, setReloadKey] = useState(0)
  const key = queryString(query)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiRequest<ApiProductPage>(`/products${key}`)
      .then((next) => {
        if (cancelled) return
        setRaw(next)
        setError(undefined)
      })
      .catch((failure: unknown) => !cancelled && setError(errorMessage(failure)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [key, reloadKey])

  const data = useMemo<ProductListData>(
    () =>
      raw
        ? {
            items: raw.items.map((product) => toProduct(product, language)),
            total: raw.total,
            page: raw.page,
            pageSize: raw.pageSize
          }
        : emptyList,
    [raw, language]
  )
  const reload = useCallback(() => setReloadKey((value) => value + 1), [])
  return { data, loading, error, reload }
}

export interface ProductState {
  readonly product?: ProductItem
  readonly loading: boolean
  readonly notFound: boolean
  readonly error?: string
}

export function useProduct(slug: string): ProductState {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage
  const [raw, setRaw] = useState<ApiProduct>()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    setError(undefined)
    apiRequest<ApiProduct>(`/products/${encodeURIComponent(slug)}`)
      .then((next) => !cancelled && setRaw(next))
      .catch((failure: unknown) => {
        if (cancelled) return
        setRaw(undefined)
        if ((failure as { status?: number }).status === 404) setNotFound(true)
        else setError(errorMessage(failure))
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [slug])

  const product = useMemo(() => (raw ? toProduct(raw, language) : undefined), [raw, language])
  return { product, loading, notFound, error }
}

/** Other products of the same category first, topped up with the newest ones. */
export function useRelatedProducts(current: ProductItem, limit = 3): readonly ProductItem[] {
  const sameCategory = useProductList({ categoryID: current.categoryID, pageSize: limit + 1 })
  const newest = useProductList({ pageSize: limit + 1 })
  return useMemo(() => {
    const seen = new Set([current.id])
    const related: ProductItem[] = []
    for (const item of [...sameCategory.data.items, ...newest.data.items]) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      related.push(item)
    }
    return related.slice(0, limit)
  }, [current.id, sameCategory.data.items, newest.data.items, limit])
}

export function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}
