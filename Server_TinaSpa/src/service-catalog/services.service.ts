import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, Service } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateServiceDto,
  ListServicesQueryDto,
  ManageServicesQueryDto,
  UpdateServiceDto,
} from './dto/service.dto.js';
import { ServiceCategoriesService } from './service-categories.service.js';
import {
  CatalogStatus,
  isUniqueViolation,
} from './service-catalog.constants.js';
import {
  toServiceResponse,
  type ServiceResponse,
} from './service-catalog.mapper.js';

const SERVICE_ORDER: Prisma.ServiceOrderByWithRelationInput[] = [
  { serviceCategory: { sortOrder: 'asc' } },
  { sortOrder: 'asc' },
  { nameVietnamese: 'asc' },
];

const SEARCH_FIELDS = [
  'nameVietnamese',
  'nameEnglish',
  'nameCambodia',
  'shortDescriptionVietnamese',
  'shortDescriptionEnglish',
  'shortDescriptionCambodia',
  'descriptionVietnamese',
  'descriptionEnglish',
  'descriptionCambodia',
] as const;

function searchWhere(search: string | undefined): Prisma.ServiceWhereInput {
  if (!search) return {};
  return {
    OR: SEARCH_FIELDS.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' },
    })),
  };
}

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categories: ServiceCategoriesService,
  ) {}

  async list(query: ListServicesQueryDto): Promise<ServiceResponse[]> {
    const services = await this.prisma.service.findMany({
      where: {
        status: CatalogStatus.ACTIVE,
        deletedAt: null,
        serviceCategory: {
          status: CatalogStatus.ACTIVE,
          deletedAt: null,
          ...(query.category ? { slug: query.category } : {}),
        },
        ...(query.bookable === undefined ? {} : { isBookable: query.bookable }),
        ...searchWhere(query.search),
      },
      include: { serviceCategory: true },
      orderBy: SERVICE_ORDER,
    });
    return services.map((service) => toServiceResponse(service));
  }

  async findBySlug(slug: string): Promise<ServiceResponse> {
    const service = await this.prisma.service.findFirst({
      where: {
        slug,
        status: CatalogStatus.ACTIVE,
        deletedAt: null,
        serviceCategory: { status: CatalogStatus.ACTIVE, deletedAt: null },
      },
      include: { serviceCategory: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return toServiceResponse(service);
  }

  async listForManage(query: ManageServicesQueryDto): Promise<ServiceResponse[]> {
    const services = await this.prisma.service.findMany({
      where: {
        deletedAt: null,
        serviceCategory: {
          deletedAt: null,
          ...(query.category ? { slug: query.category } : {}),
        },
        ...(query.status ? { status: query.status } : {}),
        ...(query.bookable === undefined ? {} : { isBookable: query.bookable }),
        ...searchWhere(query.search),
      },
      include: { serviceCategory: true },
      orderBy: SERVICE_ORDER,
    });
    return services.map((service) => toServiceResponse(service, { admin: true }));
  }

  async findForManage(serviceID: string): Promise<ServiceResponse> {
    const service = await this.prisma.service.findFirst({
      where: { serviceID, deletedAt: null },
      include: { serviceCategory: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return toServiceResponse(service, { admin: true });
  }

  async create(dto: CreateServiceDto, userAID: string): Promise<ServiceResponse> {
    const { serviceCategoryID, sortOrder, ...data } = dto;
    const category = await this.categories.getRecord(serviceCategoryID);
    const nextSortOrder =
      sortOrder ?? (await this.nextSortOrder(category.serviceCategoryAID));
    try {
      const service = await this.prisma.service.create({
        data: {
          ...data,
          sortOrder: nextSortOrder,
          serviceCategoryAID: category.serviceCategoryAID,
          createdByAID: userAID,
          updatedByAID: userAID,
        },
        include: { serviceCategory: true },
      });
      return toServiceResponse(service, { admin: true });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Service slug already exists');
      }
      throw error;
    }
  }

  async update(
    serviceID: string,
    dto: UpdateServiceDto,
    userAID: string,
  ): Promise<ServiceResponse> {
    const current = await this.getRecord(serviceID);
    const { serviceCategoryID, sortOrder, ...data } = dto;
    const category = serviceCategoryID
      ? await this.categories.getRecord(serviceCategoryID)
      : undefined;
    const movedTo =
      category && category.serviceCategoryAID !== current.serviceCategoryAID
        ? category
        : undefined;
    const nextSortOrder =
      sortOrder ??
      (movedTo ? await this.nextSortOrder(movedTo.serviceCategoryAID) : undefined);
    try {
      const service = await this.prisma.service.update({
        where: { serviceID },
        data: {
          ...data,
          ...(nextSortOrder !== undefined ? { sortOrder: nextSortOrder } : {}),
          ...(category ? { serviceCategoryAID: category.serviceCategoryAID } : {}),
          updatedByAID: userAID,
        },
        include: { serviceCategory: true },
      });
      return toServiceResponse(service, { admin: true });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Service slug already exists');
      }
      throw error;
    }
  }

  async remove(serviceID: string, userAID: string): Promise<void> {
    const service = await this.getRecord(serviceID);
    await this.prisma.service.update({
      where: { serviceAID: service.serviceAID },
      data: { deletedAt: new Date(), updatedByAID: userAID },
    });
  }

  private async nextSortOrder(serviceCategoryAID: string): Promise<number> {
    const result = await this.prisma.service.aggregate({
      where: { serviceCategoryAID, deletedAt: null },
      _max: { sortOrder: true },
    });
    return (result._max.sortOrder ?? 0) + 1;
  }

  private async getRecord(serviceID: string): Promise<Service> {
    const service = await this.prisma.service.findFirst({
      where: { serviceID, deletedAt: null },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }
}
