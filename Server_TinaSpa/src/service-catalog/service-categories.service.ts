import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, ServiceCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  CreateServiceCategoryDto,
  ListServiceCategoriesQueryDto,
  ManageServiceCategoriesQueryDto,
  UpdateServiceCategoryDto,
} from './dto/service-category.dto.js';
import {
  CatalogStatus,
  isUniqueViolation,
} from './service-catalog.constants.js';
import {
  toCategoryResponse,
  type ServiceCategoryResponse,
} from './service-catalog.mapper.js';

const CATEGORY_ORDER: Prisma.ServiceCategoryOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { nameVietnamese: 'asc' },
];

const SERVICE_ORDER: Prisma.ServiceOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { nameVietnamese: 'asc' },
];

const PUBLIC_SERVICES = {
  where: { status: CatalogStatus.ACTIVE, deletedAt: null },
  orderBy: SERVICE_ORDER,
} satisfies Prisma.ServiceCategory$servicesArgs;

const MANAGED_SERVICES = {
  where: { deletedAt: null },
  orderBy: SERVICE_ORDER,
} satisfies Prisma.ServiceCategory$servicesArgs;

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListServiceCategoriesQueryDto): Promise<ServiceCategoryResponse[]> {
    const categories = await this.prisma.serviceCategory.findMany({
      where: {
        status: CatalogStatus.ACTIVE,
        deletedAt: null,
        ...(query.featured === undefined ? {} : { isFeatured: query.featured }),
        ...(query.bookable === undefined ? {} : { isBookable: query.bookable }),
      },
      include: { services: PUBLIC_SERVICES },
      orderBy: CATEGORY_ORDER,
    });

    return categories.map((category) =>
      toCategoryResponse(category, { includeServices: query.includeServices }),
    );
  }

  async findBySlug(slug: string): Promise<ServiceCategoryResponse> {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { slug, status: CatalogStatus.ACTIVE, deletedAt: null },
      include: { services: PUBLIC_SERVICES },
    });
    if (!category) {
      throw new NotFoundException('Service category not found');
    }
    return toCategoryResponse(category, { includeServices: true });
  }

  async listForManage(
    query: ManageServiceCategoriesQueryDto,
  ): Promise<ServiceCategoryResponse[]> {
    const categories = await this.prisma.serviceCategory.findMany({
      where: { deletedAt: null, ...(query.status ? { status: query.status } : {}) },
      include: { services: MANAGED_SERVICES },
      orderBy: CATEGORY_ORDER,
    });
    return categories.map((category) => toCategoryResponse(category, { admin: true }));
  }

  async findForManage(serviceCategoryID: string): Promise<ServiceCategoryResponse> {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { serviceCategoryID, deletedAt: null },
      include: { services: MANAGED_SERVICES },
    });
    if (!category) {
      throw new NotFoundException('Service category not found');
    }
    return toCategoryResponse(category, { admin: true, includeServices: true });
  }

  async create(
    dto: CreateServiceCategoryDto,
    userAID: string,
  ): Promise<ServiceCategoryResponse> {
    try {
      const category = await this.prisma.serviceCategory.create({
        data: { ...dto, createdByAID: userAID, updatedByAID: userAID },
        include: { services: MANAGED_SERVICES },
      });
      return toCategoryResponse(category, { admin: true });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Service category slug already exists');
      }
      throw error;
    }
  }

  async update(
    serviceCategoryID: string,
    dto: UpdateServiceCategoryDto,
    userAID: string,
  ): Promise<ServiceCategoryResponse> {
    await this.getRecord(serviceCategoryID);
    try {
      const category = await this.prisma.serviceCategory.update({
        where: { serviceCategoryID },
        data: { ...dto, updatedByAID: userAID },
        include: { services: MANAGED_SERVICES },
      });
      return toCategoryResponse(category, { admin: true });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Service category slug already exists');
      }
      throw error;
    }
  }

  async remove(serviceCategoryID: string, userAID: string): Promise<void> {
    const category = await this.getRecord(serviceCategoryID);
    const serviceCount = await this.prisma.service.count({
      where: { serviceCategoryAID: category.serviceCategoryAID, deletedAt: null },
    });
    if (serviceCount > 0) {
      throw new ConflictException('Service category still has services');
    }
    await this.prisma.serviceCategory.update({
      where: { serviceCategoryAID: category.serviceCategoryAID },
      data: { deletedAt: new Date(), updatedByAID: userAID },
    });
  }

  /** Resolves a non-deleted category by its Business ID. */
  async getRecord(serviceCategoryID: string): Promise<ServiceCategory> {
    const category = await this.prisma.serviceCategory.findFirst({
      where: { serviceCategoryID, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Service category not found');
    }
    return category;
  }
}
