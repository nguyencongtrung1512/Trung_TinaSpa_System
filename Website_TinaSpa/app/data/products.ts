import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '~/i18n'

export const productCategories = ['all', 'serum', 'cream', 'sunscreen', 'mask', 'eye'] as const

export const sortOptions = ['newest', 'price-asc', 'price-desc', 'rating'] as const

export const priceFilters = ['all', 'under-500', '500-700', 'over-700'] as const

export type ProductCategoryId = (typeof productCategories)[number]
export type ProductCategory = Exclude<ProductCategoryId, 'all'>
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

export interface ProductItem {
  readonly id: string
  readonly name: string
  readonly subtitle: string
  readonly description: string
  readonly price: number
  readonly compareAt: number | null
  readonly image: string
  readonly imageAlt: string
  readonly category: ProductCategory
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

interface ProductBase {
  readonly id: string
  readonly name: string
  readonly price: number
  readonly compareAt: number | null
  readonly image: string
  readonly category: ProductCategory
  readonly createdAt: string
  readonly effectIcons: readonly string[]
  readonly gallery: readonly string[]
}

interface ProductText {
  readonly subtitle: string
  readonly description: string
  readonly imageAlt: string
  readonly badge: string
  readonly story: readonly string[]
  readonly highlights: readonly string[]
  readonly effects: readonly { readonly title: string; readonly text: string }[]
  readonly ingredients: readonly string[]
  readonly usage: readonly string[]
  readonly notes: readonly string[]
  readonly gallery: readonly string[]
}

const productBases: readonly ProductBase[] = [
  {
    id: 'luminous-elixir',
    name: 'Luminous Elixir',
    price: 890000,
    compareAt: 1050000,
    image: '/images/p4.png',
    category: 'serum',
    createdAt: '2026-09-18',
    effectIcons: ['auto_awesome', 'water_drop', 'spa'],
    gallery: ['/images/p4.png', '/images/p5.png', '/images/p6.png', '/images/p1.png']
  },
  {
    id: 'rose-renewal-cream',
    name: 'Botanical Rose Renewal Cream',
    price: 750000,
    compareAt: 890000,
    image: '/images/p6.png',
    category: 'cream',
    createdAt: '2026-09-12',
    effectIcons: ['water_drop', 'spa', 'favorite'],
    gallery: ['/images/p6.png', '/images/p4.png', '/images/p5.png', '/images/p2.png']
  },
  {
    id: 'rose-petal-toner',
    name: 'Rose Petal Infusion Toner',
    price: 550000,
    compareAt: null,
    image: '/images/p5.png',
    category: 'serum',
    createdAt: '2026-08-28',
    effectIcons: ['water_drop', 'spa', 'air'],
    gallery: ['/images/p5.png', '/images/p4.png', '/images/p6.png', '/images/p1.png']
  },
  {
    id: 'biocellulose-mask',
    name: 'Deluxe Spa Facial Biocellulose Mask',
    price: 480000,
    compareAt: null,
    image: '/images/p1.png',
    category: 'mask',
    createdAt: '2026-08-04',
    effectIcons: ['healing', 'water_drop', 'spa'],
    gallery: ['/images/p1.png', '/images/p5.png', '/images/p6.png', '/images/p4.png']
  },
  {
    id: 'luxury-sunscreen',
    name: 'Luxury Sunscreen SPF 50+',
    price: 620000,
    compareAt: 750000,
    image: '/images/p2.png',
    category: 'sunscreen',
    createdAt: '2026-07-16',
    effectIcons: ['wb_sunny', 'verified', 'face_retouching_natural'],
    gallery: ['/images/p2.png', '/images/p6.png', '/images/p3.png', '/images/p4.png']
  },
  {
    id: 'peptide-firming-eye',
    name: 'Peptide Firming Eye',
    price: 680000,
    compareAt: null,
    image: '/images/p3.png',
    category: 'eye',  
    createdAt: '2026-06-22',
    effectIcons: ['visibility', 'spa', 'favorite'],
    gallery: ['/images/p3.png', '/images/p4.png', '/images/p2.png', '/images/p6.png']
  }
]

function localizeProduct(base: ProductBase, language?: string): ProductItem {
  const t = i18n.getFixedT(language ?? i18n.resolvedLanguage ?? i18n.language)
  const text = t(`products.items.${base.id}`, { returnObjects: true }) as ProductText
  return {
    ...base,
    subtitle: text.subtitle,
    description: text.description,
    imageAlt: text.imageAlt,
    badge: text.badge,
    story: text.story,
    highlights: text.highlights,
    effects: text.effects.map((effect, index) => ({ ...effect, icon: base.effectIcons[index] ?? 'spa' })),
    ingredients: text.ingredients,
    usage: text.usage,
    notes: text.notes,
    gallery: base.gallery.map((src, index) => ({ src, alt: text.gallery[index] ?? base.name }))
  }
}

export function findProduct(id: string) {
  const base = productBases.find((item) => item.id === id)
  return base ? localizeProduct(base) : undefined
}

export function useProducts(): readonly ProductItem[] {
  const { i18n: instance } = useTranslation()
  const language = instance.resolvedLanguage
  return useMemo(() => productBases.map((base) => localizeProduct(base, language)), [language])
}

export function useProduct(id: string) {
  const products = useProducts()
  return products.find((item) => item.id === id)
}

export function useRelatedProducts(id: string, limit = 3) {
  const products = useProducts()
  const current = products.find((item) => item.id === id)
  if (!current) return []
  const others = products.filter((item) => item.id !== id)
  const sameCategory = others.filter((item) => item.category === current.category)
  const rest = others.filter((item) => item.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

export function categoryLabel(category: ProductCategoryId) {
  return i18n.t(`products.categories.${category}`)
}

export function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

export function matchesPrice(price: number, filter: PriceFilterId) {
  if (filter === 'under-500') return price < 500000
  if (filter === '500-700') return price >= 500000 && price <= 700000
  if (filter === 'over-700') return price > 700000
  return true
}
