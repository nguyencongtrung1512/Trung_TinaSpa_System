import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  Product,
  ProductCategory,
  ProductDetail,
  ProductVariant,
  ProductVariantImage,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUniqueViolation } from '../service-catalog/service-catalog.constants.js';
import type {
  ListProductsQueryDto,
  ManageProductsQueryDto,
  ProductDetailDto,
  ProductVariantDto,
  ProductVariantImageDto,
  SaveProductDto,
} from './dto/product.dto.js';
import { ProductStatus } from './products.constants.js';

export type ProductDetailResponse = {
  productDetailID: string;
  detailType: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  contentVietnamese: string | null;
  contentEnglish: string | null;
  contentCambodia: string | null;
  icon: string | null;
  image: string | null;
  imageAlt: string | null;
  sortOrder: number;
};

export type ProductVariantImageResponse = {
  productVariantImageID: string;
  image: string;
  altVietnamese: string;
  altEnglish: string | null;
  sortOrder: number;
};

export type ProductVariantResponse = {
  productVariantID: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  images: ProductVariantImageResponse[];
  status: string;
  sortOrder: number;
};

export type ProductResponse = {
  productID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  subtitleVietnamese: string | null;
  subtitleEnglish: string | null;
  subtitleCambodia: string | null;
  descriptionVietnamese: string | null;
  descriptionEnglish: string | null;
  descriptionCambodia: string | null;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  imageAlt: string | null;
  badge: string | null;
  status: string;
  createdAt: Date;
  category: {
    productCategoryID: string;
    slug: string;
    nameVietnamese: string;
    nameEnglish: string | null;
    nameCambodia: string | null;
  };
  /** Public reads list active variants only; management reads list all. */
  variants: ProductVariantResponse[];
  /** Single-product reads only. */
  details?: ProductDetailResponse[];
  /** Management reads only. */
  note?: string | null;
  updatedAt?: Date;
};

export type ProductListResponse = {
  items: ProductResponse[];
  total: number;
  page: number;
  pageSize: number;
};

type ProductRecord = Product & {
  productCategory: ProductCategory;
  variants: (ProductVariant & { images: ProductVariantImage[] })[];
  details?: ProductDetail[];
};

const variantOrder = [{ sortOrder: 'asc' }, { productVariantID: 'asc' }] satisfies Prisma.ProductVariantOrderByWithRelationInput[];
const imageOrder = [{ sortOrder: 'asc' }, { productVariantImageID: 'asc' }] satisfies Prisma.ProductVariantImageOrderByWithRelationInput[];
const variantInclude = { orderBy: variantOrder, include: { images: { orderBy: imageOrder } } } as const;
const productInclude = {
  productCategory: true,
  variants: variantInclude,
} satisfies Prisma.ProductInclude;
const productWithDetails = {
  productCategory: true,
  variants: variantInclude,
  details: { orderBy: [{ sortOrder: 'asc' }, { productDetailID: 'asc' }] },
} satisfies Prisma.ProductInclude;

const orNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;

function toDetail(record: ProductDetail): ProductDetailResponse {
  return {
    productDetailID: record.productDetailID,
    detailType: record.detailType,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    contentVietnamese: record.contentVietnamese,
    contentEnglish: record.contentEnglish,
    contentCambodia: record.contentCambodia,
    icon: record.icon,
    image: record.image,
    imageAlt: record.imageAlt,
    sortOrder: record.sortOrder,
  };
}

function toVariant(record: ProductVariant & { images: ProductVariantImage[] }): ProductVariantResponse {
  return {
    productVariantID: record.productVariantID,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    sku: record.sku,
    price: Number(record.price),
    compareAtPrice: record.compareAtPrice === null ? null : Number(record.compareAtPrice),
    images: record.images.map((image) => ({
      productVariantImageID: image.productVariantImageID,
      image: image.image,
      altVietnamese: image.nameVietnamese,
      altEnglish: image.nameEnglish,
      sortOrder: image.sortOrder,
    })),
    status: record.status,
    sortOrder: record.sortOrder,
  };
}

/** The "from" price shown on cards: the cheapest active variant (any variant if none is active). */
function fromPrice(variants: { price: number; compareAtPrice: number | null; status?: string }[]) {
  const active = variants.filter((variant) => (variant.status ?? ProductStatus.ACTIVE) === ProductStatus.ACTIVE);
  const pool = active.length > 0 ? active : variants;
  const cheapest = pool.reduce((best, variant) => (variant.price < best.price ? variant : best), pool[0]);
  return { price: cheapest.price, compareAtPrice: cheapest.compareAtPrice };
}

function toResponse(record: ProductRecord, admin = false): ProductResponse {
  const category = record.productCategory;
  return {
    productID: record.productID,
    slug: record.slug,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    subtitleVietnamese: record.subtitleVietnamese,
    subtitleEnglish: record.subtitleEnglish,
    subtitleCambodia: record.subtitleCambodia,
    descriptionVietnamese: record.descriptionVietnamese,
    descriptionEnglish: record.descriptionEnglish,
    descriptionCambodia: record.descriptionCambodia,
    price: Number(record.price),
    compareAtPrice: record.compareAtPrice === null ? null : Number(record.compareAtPrice),
    image: record.image,
    imageAlt: record.imageAlt,
    badge: record.badge,
    status: record.status,
    createdAt: record.createdAt,
    category: {
      productCategoryID: category.productCategoryID,
      slug: category.slug,
      nameVietnamese: category.nameVietnamese,
      nameEnglish: category.nameEnglish,
      nameCambodia: category.nameCambodia,
    },
    variants: record.variants
      .filter((variant) => admin || variant.status === ProductStatus.ACTIVE)
      .map(toVariant),
    ...(record.details ? { details: record.details.map(toDetail) } : {}),
    ...(admin ? { note: record.note, updatedAt: record.updatedAt } : {}),
  };
}

function variantData(variant: ProductVariantDto, index: number) {
  return {
    nameVietnamese: variant.nameVietnamese,
    nameEnglish: orNull(variant.nameEnglish),
    nameCambodia: orNull(variant.nameCambodia),
    sku: orNull(variant.sku),
    price: variant.price,
    compareAtPrice: variant.compareAtPrice ?? null,
    status: variant.status ?? ProductStatus.ACTIVE,
    sortOrder: variant.sortOrder ?? index,
  };
}

function imageRows(variant: ProductVariantDto, actorAID: string) {
  return (variant.images ?? []).map((image: ProductVariantImageDto, index) => ({
    image: image.image,
    nameVietnamese: orNull(image.altVietnamese) ?? variant.nameVietnamese,
    nameEnglish: orNull(image.altEnglish),
    sortOrder: index,
    createdByAID: actorAID,
    updatedByAID: actorAID,
  }));
}

function detailData(detail: ProductDetailDto, index: number) {
  return {
    detailType: detail.detailType,
    nameVietnamese: detail.nameVietnamese,
    nameEnglish: orNull(detail.nameEnglish),
    nameCambodia: orNull(detail.nameCambodia),
    contentVietnamese: orNull(detail.contentVietnamese),
    contentEnglish: orNull(detail.contentEnglish),
    contentCambodia: orNull(detail.contentCambodia),
    icon: orNull(detail.icon),
    image: orNull(detail.image),
    imageAlt: orNull(detail.imageAlt),
    sortOrder: detail.sortOrder ?? index,
  };
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQueryDto): Promise<ProductListResponse> {
    return this.page(
      {
        deletedAt: null,
        status: ProductStatus.ACTIVE,
        productCategory: {
          isActive: true,
          ...(query.categoryID ? { productCategoryID: query.categoryID } : {}),
        },
        ...this.filters(query),
      },
      query,
    );
  }

  async findBySlug(slug: string): Promise<ProductResponse> {
    const record = await this.prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: ProductStatus.ACTIVE,
        productCategory: { isActive: true },
      },
      include: productWithDetails,
    });
    if (!record) throw new NotFoundException('Product not found');
    return toResponse(record);
  }

  async listForManage(query: ManageProductsQueryDto): Promise<ProductListResponse> {
    return this.page(
      {
        deletedAt: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.categoryID
          ? { productCategory: { productCategoryID: query.categoryID } }
          : {}),
        ...this.filters(query),
      },
      query,
      true,
    );
  }

  async findForManage(productID: string): Promise<ProductResponse> {
    const record = await this.prisma.product.findFirst({
      where: { productID, deletedAt: null },
      include: productWithDetails,
    });
    if (!record) throw new NotFoundException('Product not found');
    return toResponse(record, true);
  }

  async create(dto: SaveProductDto, actorAID: string): Promise<ProductResponse> {
    if (!dto.nameVietnamese) throw new BadRequestException('nameVietnamese should not be empty');
    if (!dto.slug) throw new BadRequestException('slug should not be empty');
    if (!dto.productCategoryID) {
      throw new BadRequestException('productCategoryID should not be empty');
    }
    this.assertVariants(dto.variants, true);
    const from = fromPrice(this.variantInputs(dto.variants!));

    const productCategoryAID = await this.categoryAID(dto.productCategoryID);
    try {
      const record = await this.prisma.product.create({
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          slug: dto.slug,
          productCategoryAID,
          subtitleVietnamese: orNull(dto.subtitleVietnamese),
          subtitleEnglish: orNull(dto.subtitleEnglish),
          subtitleCambodia: orNull(dto.subtitleCambodia),
          descriptionVietnamese: orNull(dto.descriptionVietnamese),
          descriptionEnglish: orNull(dto.descriptionEnglish),
          descriptionCambodia: orNull(dto.descriptionCambodia),
          price: from.price,
          compareAtPrice: from.compareAtPrice,
          image: orNull(dto.image),
          imageAlt: orNull(dto.imageAlt),
          badge: orNull(dto.badge),
          status: dto.status ?? ProductStatus.ACTIVE,
          note: orNull(dto.note),
          createdByAID: actorAID,
          updatedByAID: actorAID,
          variants: {
            create: dto.variants!.map((variant, index) => ({
              ...variantData(variant, index),
              createdByAID: actorAID,
              updatedByAID: actorAID,
              images: { create: imageRows(variant, actorAID) },
            })),
          },
          details: {
            create: (dto.details ?? []).map((detail, index) => ({
              ...detailData(detail, index),
              createdByAID: actorAID,
              updatedByAID: actorAID,
            })),
          },
        },
        include: productWithDetails,
      });
      return toResponse(record, true);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async update(
    productID: string,
    dto: SaveProductDto,
    actorAID: string,
  ): Promise<ProductResponse> {
    const existing = await this.prisma.product.findFirst({
      where: { productID, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Product not found');

    if (dto.variants) this.assertVariants(dto.variants, true);

    const productCategoryAID = dto.productCategoryID
      ? await this.categoryAID(dto.productCategoryID)
      : undefined;

    try {
      const record = await this.prisma.$transaction(async (tx) => {
        if (dto.details) {
          await tx.productDetail.deleteMany({ where: { productAID: existing.productAID } });
        }
        const from = dto.variants
          ? await this.syncVariants(tx, existing.productAID, dto.variants, actorAID)
          : undefined;
        return tx.product.update({
          where: { productAID: existing.productAID },
          data: {
            nameVietnamese: dto.nameVietnamese,
            nameEnglish: orNull(dto.nameEnglish),
            nameCambodia: orNull(dto.nameCambodia),
            slug: dto.slug,
            productCategoryAID,
            subtitleVietnamese: orNull(dto.subtitleVietnamese),
            subtitleEnglish: orNull(dto.subtitleEnglish),
            subtitleCambodia: orNull(dto.subtitleCambodia),
            descriptionVietnamese: orNull(dto.descriptionVietnamese),
            descriptionEnglish: orNull(dto.descriptionEnglish),
            descriptionCambodia: orNull(dto.descriptionCambodia),
            price: from?.price,
            compareAtPrice: from?.compareAtPrice,
            image: orNull(dto.image),
            imageAlt: orNull(dto.imageAlt),
            badge: orNull(dto.badge),
            status: dto.status,
            note: orNull(dto.note),
            updatedByAID: actorAID,
            ...(dto.details
              ? {
                  details: {
                    create: dto.details.map((detail, index) => ({
                      ...detailData(detail, index),
                      createdByAID: actorAID,
                      updatedByAID: actorAID,
                    })),
                  },
                }
              : {}),
          },
          include: productWithDetails,
        });
      });
      return toResponse(record, true);
    } catch (error) {
      throw this.translate(error);
    }
  }

  /** Soft delete; the row stays for audit but disappears from every read. */
  async remove(productID: string, actorAID: string): Promise<void> {
    const existing = await this.prisma.product.findFirst({
      where: { productID, deletedAt: null },
      select: { productAID: true },
    });
    if (!existing) throw new NotFoundException('Product not found');
    await this.prisma.product.update({
      where: { productAID: existing.productAID },
      data: { deletedAt: new Date(), updatedByAID: actorAID },
    });
  }

  private assertVariants(variants: ProductVariantDto[] | undefined, required: boolean) {
    if (!variants || variants.length === 0) {
      if (required) throw new BadRequestException('At least one variant is required');
      return;
    }
    for (const variant of variants) {
      if (variant.compareAtPrice != null && variant.compareAtPrice < variant.price) {
        throw new BadRequestException('compareAtPrice must not be lower than price');
      }
    }
    const skus = variants.map((variant) => variant.sku).filter(Boolean);
    if (new Set(skus).size !== skus.length) {
      throw new BadRequestException('Variant SKU must be unique');
    }
  }

  private variantInputs(variants: ProductVariantDto[]) {
    return variants.map((variant) => ({
      price: variant.price,
      compareAtPrice: variant.compareAtPrice ?? null,
      status: variant.status ?? ProductStatus.ACTIVE,
    }));
  }

  /**
   * Reconciles the stored variants with the submitted list (by productVariantID) and returns the
   * new "from" price. Variants missing from the list are deleted.
   */
  private async syncVariants(
    tx: Prisma.TransactionClient,
    productAID: string,
    variants: ProductVariantDto[],
    actorAID: string,
  ) {
    const stored = await tx.productVariant.findMany({
      where: { productAID },
      select: { productVariantID: true, productVariantAID: true },
    });
    const storedByID = new Map(stored.map((item) => [item.productVariantID, item.productVariantAID]));
    const keep = new Set<string>();
    for (const variant of variants) {
      if (variant.productVariantID) {
        if (!storedByID.has(variant.productVariantID)) {
          throw new BadRequestException('Product variant not found');
        }
        keep.add(variant.productVariantID);
      }
    }
    const removed = stored.filter((item) => !keep.has(item.productVariantID));
    if (removed.length > 0) {
      await tx.productVariant.deleteMany({
        where: { productVariantAID: { in: removed.map((item) => item.productVariantAID) } },
      });
    }
    for (const [index, variant] of variants.entries()) {
      const data = variantData(variant, index);
      if (variant.productVariantID) {
        await tx.productVariant.update({
          where: { productVariantAID: storedByID.get(variant.productVariantID)! },
          data: {
            ...data,
            updatedByAID: actorAID,
            ...(variant.images
              ? { images: { deleteMany: {}, create: imageRows(variant, actorAID) } }
              : {}),
          },
        });
      } else {
        await tx.productVariant.create({
          data: {
            ...data,
            productAID,
            createdByAID: actorAID,
            updatedByAID: actorAID,
            images: { create: imageRows(variant, actorAID) },
          },
        });
      }
    }
    return fromPrice(this.variantInputs(variants));
  }

  private async categoryAID(productCategoryID: string): Promise<string> {
    const category = await this.prisma.productCategory.findUnique({
      where: { productCategoryID },
      select: { productCategoryAID: true },
    });
    if (!category) throw new BadRequestException('Product category not found');
    return category.productCategoryAID;
  }

  private filters(query: ListProductsQueryDto): Prisma.ProductWhereInput {
    const search = query.search?.trim();
    const price: Prisma.DecimalFilter = {};
    if (query.minPrice !== undefined) price.gte = query.minPrice;
    if (query.maxPrice !== undefined) price.lte = query.maxPrice;
    return {
      ...(Object.keys(price).length ? { price } : {}),
      ...(search
        ? {
            OR: [
              { nameVietnamese: { contains: search, mode: 'insensitive' } },
              { nameEnglish: { contains: search, mode: 'insensitive' } },
              { nameCambodia: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private orderBy(sort: ListProductsQueryDto['sort']): Prisma.ProductOrderByWithRelationInput[] {
    if (sort === 'price-asc') return [{ price: 'asc' }, { productID: 'asc' }];
    if (sort === 'price-desc') return [{ price: 'desc' }, { productID: 'asc' }];
    return [{ createdAt: 'desc' }, { productID: 'desc' }];
  }

  private async page(
    where: Prisma.ProductWhereInput,
    query: ListProductsQueryDto,
    admin = false,
  ): Promise<ProductListResponse> {
    const [total, records] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: this.orderBy(query.sort),
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);
    return {
      items: records.map((record) => toResponse(record, admin)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  private translate(error: unknown): unknown {
    if (!isUniqueViolation(error)) return error;
    const target = JSON.stringify((error as Prisma.PrismaClientKnownRequestError).meta?.target ?? '');
    return new ConflictException(
      /sku/i.test(target) ? 'Variant SKU already exists' : 'Product slug already exists',
    );
  }
}
