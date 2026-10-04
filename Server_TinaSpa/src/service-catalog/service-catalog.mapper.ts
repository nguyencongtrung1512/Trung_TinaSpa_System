import type { Service, ServiceCategory } from '@prisma/client';

export type ServiceCategorySummary = {
  serviceCategoryID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  image: string | null;
  imageAlt: string | null;
};

export type ServiceResponse = {
  serviceID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  shortDescriptionVietnamese: string | null;
  shortDescriptionEnglish: string | null;
  shortDescriptionCambodia: string | null;
  descriptionVietnamese: string | null;
  descriptionEnglish: string | null;
  descriptionCambodia: string | null;
  price: number;
  durationMinutes: number | null;
  image: string | null;
  imageAlt: string | null;
  isBookable: boolean;
  sortOrder: number;
  status: string;
  category?: ServiceCategorySummary;
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ServiceCategoryResponse = {
  serviceCategoryID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  descriptionVietnamese: string | null;
  descriptionEnglish: string | null;
  descriptionCambodia: string | null;
  icon: string | null;
  image: string | null;
  imageAlt: string | null;
  isFeatured: boolean;
  isBookable: boolean;
  sortOrder: number;
  status: string;
  serviceCount: number;
  minPrice: number | null;
  services?: ServiceResponse[];
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type MapOptions = {
  /** Adds note / createdAt / updatedAt for the management screens. */
  readonly admin?: boolean;
};

export function toCategorySummary(category: ServiceCategory): ServiceCategorySummary {
  return {
    serviceCategoryID: category.serviceCategoryID,
    slug: category.slug,
    nameVietnamese: category.nameVietnamese,
    nameEnglish: category.nameEnglish,
    nameCambodia: category.nameCambodia,
    image: category.image,
    imageAlt: category.imageAlt,
  };
}

export function toServiceResponse(
  service: Service & { serviceCategory?: ServiceCategory },
  options: MapOptions = {},
): ServiceResponse {
  return {
    serviceID: service.serviceID,
    slug: service.slug,
    nameVietnamese: service.nameVietnamese,
    nameEnglish: service.nameEnglish,
    nameCambodia: service.nameCambodia,
    shortDescriptionVietnamese: service.shortDescriptionVietnamese,
    shortDescriptionEnglish: service.shortDescriptionEnglish,
    shortDescriptionCambodia: service.shortDescriptionCambodia,
    descriptionVietnamese: service.descriptionVietnamese,
    descriptionEnglish: service.descriptionEnglish,
    descriptionCambodia: service.descriptionCambodia,
    price: service.price.toNumber(),
    durationMinutes: service.durationMinutes,
    image: service.image,
    imageAlt: service.imageAlt,
    isBookable: service.isBookable,
    sortOrder: service.sortOrder,
    status: service.status,
    ...(service.serviceCategory
      ? { category: toCategorySummary(service.serviceCategory) }
      : {}),
    ...(options.admin
      ? { note: service.note, createdAt: service.createdAt, updatedAt: service.updatedAt }
      : {}),
  };
}

export function toCategoryResponse(
  category: ServiceCategory & { services?: Service[] },
  options: MapOptions & { readonly includeServices?: boolean } = {},
): ServiceCategoryResponse {
  const services = category.services ?? [];
  const prices = services.map((service) => service.price.toNumber());

  return {
    serviceCategoryID: category.serviceCategoryID,
    slug: category.slug,
    nameVietnamese: category.nameVietnamese,
    nameEnglish: category.nameEnglish,
    nameCambodia: category.nameCambodia,
    descriptionVietnamese: category.descriptionVietnamese,
    descriptionEnglish: category.descriptionEnglish,
    descriptionCambodia: category.descriptionCambodia,
    icon: category.icon,
    image: category.image,
    imageAlt: category.imageAlt,
    isFeatured: category.isFeatured,
    isBookable: category.isBookable,
    sortOrder: category.sortOrder,
    status: category.status,
    serviceCount: services.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    ...(options.includeServices
      ? { services: services.map((service) => toServiceResponse(service, options)) }
      : {}),
    ...(options.admin
      ? { note: category.note, createdAt: category.createdAt, updatedAt: category.updatedAt }
      : {}),
  };
}
