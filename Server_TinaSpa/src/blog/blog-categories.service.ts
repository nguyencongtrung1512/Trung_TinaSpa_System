import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BlogCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUniqueViolation } from '../service-catalog/service-catalog.constants.js';
import type { SaveBlogCategoryDto } from './dto/blog-category.dto.js';

export type BlogCategoryResponse = {
  blogCategoryID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  blogCount: number;
  /** Management reads only. */
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const orNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;

function toResponse(
  record: BlogCategory & { _count: { blogs: number } },
  admin = false,
): BlogCategoryResponse {
  return {
    blogCategoryID: record.blogCategoryID,
    slug: record.slug,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    description: record.description,
    displayOrder: record.displayOrder,
    isActive: record.isActive,
    blogCount: record._count.blogs,
    ...(admin
      ? { note: record.note, createdAt: record.createdAt, updatedAt: record.updatedAt }
      : {}),
  };
}

@Injectable()
export class BlogCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<BlogCategoryResponse[]> {
    const records = await this.prisma.blogCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            blogs: { where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } } },
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { blogCategoryID: 'asc' }],
    });
    return records.map((record) => toResponse(record));
  }

  async listForManage(): Promise<BlogCategoryResponse[]> {
    const records = await this.prisma.blogCategory.findMany({
      include: { _count: { select: { blogs: true } } },
      orderBy: [{ displayOrder: 'asc' }, { blogCategoryID: 'asc' }],
    });
    return records.map((record) => toResponse(record, true));
  }

  /** Public: an active category by slug, counting only live posts. */
  async findBySlug(slug: string): Promise<BlogCategoryResponse> {
    const record = await this.prisma.blogCategory.findFirst({
      where: { slug, isActive: true },
      include: {
        _count: {
          select: {
            blogs: { where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } } },
          },
        },
      },
    });
    if (!record) throw new NotFoundException('Blog category not found');
    return toResponse(record);
  }

  async findForManage(blogCategoryID: string): Promise<BlogCategoryResponse> {
    const record = await this.prisma.blogCategory.findUnique({
      where: { blogCategoryID },
      include: { _count: { select: { blogs: true } } },
    });
    if (!record) throw new NotFoundException('Blog category not found');
    return toResponse(record, true);
  }

  /** Hard delete (the table has no deletedAt); refused while any post still uses the category. */
  async remove(blogCategoryID: string): Promise<void> {
    const record = await this.prisma.blogCategory.findUnique({
      where: { blogCategoryID },
      include: { _count: { select: { blogs: true } } },
    });
    if (!record) throw new NotFoundException('Blog category not found');
    if (record._count.blogs > 0) {
      throw new ConflictException('Blog category still has blogs');
    }
    await this.prisma.blogCategory.delete({ where: { blogCategoryID } });
  }

  async create(dto: SaveBlogCategoryDto, actorAID: string): Promise<BlogCategoryResponse> {
    if (!dto.nameVietnamese) {
      throw new BadRequestException('nameVietnamese should not be empty');
    }
    if (!dto.slug) throw new BadRequestException('slug should not be empty');
    void actorAID; // BlogCategory has no audit-by columns (see schema).
    try {
      const record = await this.prisma.blogCategory.create({
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          slug: dto.slug,
          description: orNull(dto.description),
          displayOrder: dto.displayOrder ?? 0,
          isActive: dto.isActive ?? true,
          note: orNull(dto.note),
        },
        include: { _count: { select: { blogs: true } } },
      });
      return toResponse(record, true);
    } catch (error) {
      throw this.translate(error);
    }
  }

  async update(blogCategoryID: string, dto: SaveBlogCategoryDto): Promise<BlogCategoryResponse> {
    const existing = await this.prisma.blogCategory.findUnique({ where: { blogCategoryID } });
    if (!existing) throw new NotFoundException('Blog category not found');
    try {
      const record = await this.prisma.blogCategory.update({
        where: { blogCategoryID },
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          slug: dto.slug,
          description: orNull(dto.description),
          displayOrder: dto.displayOrder,
          isActive: dto.isActive,
          note: orNull(dto.note),
        },
        include: { _count: { select: { blogs: true } } },
      });
      return toResponse(record, true);
    } catch (error) {
      throw this.translate(error);
    }
  }

  private translate(error: unknown): unknown {
    return isUniqueViolation(error)
      ? new ConflictException('Blog category slug already exists')
      : error;
  }
}
