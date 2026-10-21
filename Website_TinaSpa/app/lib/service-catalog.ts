import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ServiceMenu } from '~/data/home'
import { apiRequest } from '~/lib/api'
import { formatPrice, type CatalogCategory, type CatalogService } from '~/portal/manager/services/catalog.api'

/** Public catalog: only active categories and services are returned. */
export const publicCatalogApi = {
  listCategories: () => apiRequest<CatalogCategory[]>('/service-categories'),
  listServices: () => apiRequest<CatalogService[]>('/services')
}

/** Used in turn for categories that have no image of their own. */
const FALLBACK_IMAGES = ['/images/p1.png', '/images/p4.png', '/images/p2.png', '/images/p3.png', '/images/p5.png']

const pick = (english: boolean, vietnamese: string, translated: string | null) =>
  english && translated ? translated : vietnamese

function toMenus(
  categories: readonly CatalogCategory[],
  services: readonly CatalogService[],
  english: boolean
): ServiceMenu[] {
  return categories.flatMap((category, index) => {
    const items = services
      .filter((service) => service.category?.serviceCategoryID === category.serviceCategoryID)
      .map((service) => {
        const summary = english
          ? (service.shortDescriptionEnglish ?? service.shortDescriptionVietnamese)
          : service.shortDescriptionVietnamese
        const description = english
          ? (service.descriptionEnglish ?? service.descriptionVietnamese)
          : service.descriptionVietnamese
        return {
          id: service.slug,
          name: pick(english, service.nameVietnamese, service.nameEnglish),
          summary: summary ?? '',
          description: description ?? summary ?? '',
          price: formatPrice(service.price)
        }
      })
    if (items.length === 0) return []
    const title = pick(english, category.nameVietnamese, category.nameEnglish)
    return [
      {
        id: category.slug,
        title,
        image: category.image ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
        imageAlt: category.imageAlt ?? title,
        items
      }
    ]
  })
}

export type CatalogMenusState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly menus: readonly ServiceMenu[] }

/** Active service categories with their services, grouped for the public service menu. */
export function useCatalogMenus() {
  const { i18n } = useTranslation()
  const english = i18n.language.startsWith('en')
  const [data, setData] = useState<{ categories: CatalogCategory[]; services: CatalogService[] }>()
  const [error, setError] = useState<string>()
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setError(undefined)
    Promise.all([publicCatalogApi.listCategories(), publicCatalogApi.listServices()])
      .then(([categories, services]) => {
        if (!cancelled) setData({ categories, services })
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : '')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((value) => value + 1), [])
  const menus = useMemo(() => (data ? toMenus(data.categories, data.services, english) : undefined), [data, english])

  const state: CatalogMenusState =
    error !== undefined
      ? { status: 'error', message: error }
      : menus
        ? { status: 'ready', menus }
        : { status: 'loading' }

  return { state, reload }
}
