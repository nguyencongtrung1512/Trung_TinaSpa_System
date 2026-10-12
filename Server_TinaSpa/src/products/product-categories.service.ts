import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProductCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUniqueViolation } from '../service-catalog/service-catalog.constants.js';
import type { SaveProductCategoryDto } from './dto/product-category.dto.js';
import { ProductStatus } from './products.constants.js';

export type ProductCategoryResponse = {
  productCategoryID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  /** Management reads only. */
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const orNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;

function toResponse(
  record: ProductCategory & { _count: { products: number } },
  admin = false,
): ProductCategoryResponse {
  return {
    productCategoryID: record.productCategoryID,
    slug: record.slug,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    description: record.description,
    displayOrder: record.displayOrder,
    isActive: record.isActive,
    productCount: record._count.products,
    ...(admin
      ? { note: record.note, createdAt: record.createdAt, updatedAt: record.updatedAt }
      : {}),
  };
}

@Injectable()
export class ProductCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<ProductCategoryResponse[]> {
    const records = await this.prisma.productCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { status: ProductStatus.ACTIVE, deletedAt: null } } },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { productCategoryID: 'asc' }],
    });
    return records.map((record) => toResponse(record));
  }

  async listForManage(): Promise<ProductCategoryResponse[]> {
    const records = await this.prisma.productCategory.findMany({
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      orderBy: [{ displayOrder: 'asc' }, { productCategoryID: 'asc' }],
    });
    return records.map((record) => toResponse(record, true));
  }

  async create(dto: SaveProductCategoryDto, actorAID: string): Promise<ProductCategoryResponse> {
    if (!dto.nameVietnamese) {
      throw new BadRequestException('nameVietnamese should not be empty');
    }
    if (!dto.slug) throw new BadRequestException('slug should not be empty');
    try {
      const record = await this.prisma.productCategory.create({
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          slug: dto.slug,
          description: orNull(dto.description),
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
          note: orNull(dto.note),
          createdByAID: actorAID,
          updatedByAID: actorAID,
        },
        include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      });
      return toResponse(record, true);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async update(
    productCategoryID: string,
    dto: SaveProductCategoryDto,
    actorAID: string,
  ): Promise<ProductCategoryResponse> {
    const existing = await this.prisma.productCategory.findUnique({ where: { productCategoryID } });
    if (!existing) throw new NotFoundException('Product category not found');
    try {
      const record = await this.prisma.productCategory.update({
        where: { productCategoryID },
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          slug: dto.slug,
          description: orNull(dto.description),
          displayOrder: dto.displayOrder,
          isActive: dto.isActive,
          note: orNull(dto.note),
          updatedByAID: actorAID,
        },
        include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      });
      return toResponse(record, true);
    } catch (error) {
      throw this.translate(error);
    }
  }

  /** Hard delete, allowed only when the category holds no live product. */
  async remove(productCategoryID: string): Promise<void> {
    const existing = await this.prisma.productCategory.findUnique({
      where: { productCategoryID },
      include: { _count: { select: { products: { where: { deletedAt: null } } } } },
    });
    if (!existing) throw new NotFoundException('Product category not found');
    if (existing._count.products > 0) {
      throw new ConflictException('Product category still has products');
    }
    // Soft-deleted products still reference the category (FK RESTRICT): purge them with it.
    await this.prisma.$transaction([
      this.prisma.product.deleteMany({
        where: { productCategoryAID: existing.productCategoryAID, deletedAt: { not: null } },
      }),
      this.prisma.productCategory.delete({
        where: { productCategoryAID: existing.productCategoryAID },
      }),
    ]);
  }

  private translate(error: unknown): unknown {
    return isUniqueViolation(error)
      ? new ConflictException('Product category slug already exists')
      : error;
  }
}
