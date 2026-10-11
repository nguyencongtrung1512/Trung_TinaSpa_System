import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthUser } from '../auth/types/auth-user.js';
import { RoleName } from '../common/constants/roles.js';
import { sanitizeBlogHtml } from '../common/utils/html-sanitizer.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUniqueViolation } from '../service-catalog/service-catalog.constants.js';
import { BlogStatus } from './blog.constants.js';
import type {
  ListBlogsQueryDto,
  ManageBlogsQueryDto,
  SaveBlogDto,
} from './dto/blog.dto.js';

const blogInclude = {
  blogCategory: {
    select: {
      blogCategoryID: true,
      slug: true,
      nameVietnamese: true,
      nameEnglish: true,
      nameCambodia: true,
    },
  },
  author: { select: { userID: true, fullName: true } },
} satisfies Prisma.BlogInclude;

type BlogRecord = Prisma.BlogGetPayload<{ include: typeof blogInclude }>;

export type BlogResponse = {
  blogID: string;
  slug: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  nameCambodia: string | null;
  summary: string | null;
  /** Sanitized HTML; only present on single-blog reads. */
  content?: string | null;
  thumbnailURL: string | null;
  status: string;
  publishedAt: Date | null;
  isFeatured: boolean;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  category: BlogRecord['blogCategory'];
  author: BlogRecord['author'];
  /** Management reads only. */
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type BlogListResponse = {
  items: BlogResponse[];
  total: number;
  page: number;
  pageSize: number;
};

function toResponse(
  record: BlogRecord,
  options: { content?: boolean; admin?: boolean } = {},
): BlogResponse {
  return {
    blogID: record.blogID,
    slug: record.slug,
    nameVietnamese: record.nameVietnamese,
    nameEnglish: record.nameEnglish,
    nameCambodia: record.nameCambodia,
    summary: record.summary,
    ...(options.content ? { content: record.content } : {}),
    thumbnailURL: record.thumbnailURL,
    status: record.status,
    publishedAt: record.publishedAt,
    isFeatured: record.isFeatured,
    viewCount: record.viewCount,
    metaTitle: record.metaTitle,
    metaDescription: record.metaDescription,
    category: record.blogCategory,
    author: record.author,
    ...(options.admin
      ? {
          note: record.note,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }
      : {}),
  };
}

/** Empty strings clear an optional text column. */
const orNull = (value: string | null | undefined) =>
  value === undefined ? undefined : value || null;

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Public list: published, already released, in an active category. Content is left out. */
  async list(query: ListBlogsQueryDto): Promise<BlogListResponse> {
    return this.page(
      {
        status: BlogStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
        blogCategory: {
          isActive: true,
          ...(query.categoryID ? { blogCategoryID: query.categoryID } : {}),
        },
        ...(query.featured === undefined ? {} : { isFeatured: query.featured }),
        ...this.searchFilter(query.search),
      },
      query,
      [{ publishedAt: 'desc' }, { blogID: 'desc' }],
    );
  }

  /** Public read by slug; counts one view. */
  async findPublishedBySlug(slug: string): Promise<BlogResponse> {
    const found = await this.prisma.blog.findFirst({
      where: {
        slug,
        status: BlogStatus.PUBLISHED,
        publishedAt: { lte: new Date() },
        blogCategory: { isActive: true },
      },
      select: { blogAID: true },
    });
    if (!found) throw new NotFoundException('Blog not found');

    const record = await this.prisma.blog.update({
      where: { blogAID: found.blogAID },
      data: { viewCount: { increment: 1 } },
      include: blogInclude,
    });
    return toResponse(record, { content: true });
  }

  async listForManage(
    query: ManageBlogsQueryDto,
    actor: AuthUser,
  ): Promise<BlogListResponse> {
    return this.page(
      {
        ...(query.mine ? { authorAID: actor.userAID } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.categoryID
          ? { blogCategory: { blogCategoryID: query.categoryID } }
          : {}),
        ...(query.featured === undefined ? {} : { isFeatured: query.featured }),
        ...this.searchFilter(query.search),
      },
      query,
      [{ createdAt: 'desc' }, { blogID: 'desc' }],
      true,
    );
  }

  /** Every management role may read every post; editing is restricted in `update`. */
  async findForManage(blogID: string): Promise<BlogResponse> {
    return toResponse(await this.getRecord(blogID), {
      content: true,
      admin: true,
    });
  }

  async create(dto: SaveBlogDto, actor: AuthUser): Promise<BlogResponse> {
    const actorAID = actor.userAID;
    const manager = actor.roles.includes(RoleName.MANAGER);
    if (!manager) this.assertDraftOnly(dto);
    if (!dto.nameVietnamese) {
      throw new BadRequestException('nameVietnamese should not be empty');
    }
    if (!dto.slug) throw new BadRequestException('slug should not be empty');
    if (!dto.blogCategoryID) {
      throw new BadRequestException('blogCategoryID should not be empty');
    }

    const category = await this.getCategory(dto.blogCategoryID);
    // Staff posts always start as drafts; only a manager may publish.
    const { status, publishedAt } = manager
      ? this.resolvePublishing(dto.status ?? BlogStatus.DRAFT, dto.publishedAt, null)
      : { status: BlogStatus.DRAFT, publishedAt: null };

    try {
      const record = await this.prisma.blog.create({
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          blogCategoryAID: category.blogCategoryAID,
          slug: dto.slug,
          summary: orNull(dto.summary),
          content: dto.content ? sanitizeBlogHtml(dto.content) : null,
          thumbnailURL: orNull(dto.thumbnailURL),
          authorAID: actorAID,
          status,
          publishedAt,
          isFeatured: manager ? (dto.isFeatured ?? false) : false,
          metaTitle: orNull(dto.metaTitle),
          metaDescription: orNull(dto.metaDescription),
          createdByAID: actorAID,
          updatedByAID: actorAID,
          note: orNull(dto.note),
        },
        include: blogInclude,
      });
      return toResponse(record, { content: true, admin: true });
    } catch (error) {
      throw this.translate(error);
    }
  }

  async update(
    blogID: string,
    dto: SaveBlogDto,
    actor: AuthUser,
  ): Promise<BlogResponse> {
    const actorAID = actor.userAID;
    const current = await this.getRecord(blogID);
    if (!actor.roles.includes(RoleName.MANAGER)) {
      if (current.authorAID !== actorAID) {
        throw new ForbiddenException('Insufficient role');
      }
      if (current.status !== BlogStatus.DRAFT) {
        throw new ForbiddenException('Only draft blogs can be edited');
      }
      this.assertDraftOnly(dto);
    }
    const category = dto.blogCategoryID
      ? await this.getCategory(dto.blogCategoryID)
      : undefined;

    const publishing =
      dto.status !== undefined || dto.publishedAt !== undefined
        ? this.resolvePublishing(
            dto.status ?? (current.status as BlogStatus),
            dto.publishedAt,
            current.publishedAt,
          )
        : undefined;

    try {
      const record = await this.prisma.blog.update({
        where: { blogID },
        data: {
          nameVietnamese: dto.nameVietnamese,
          nameEnglish: orNull(dto.nameEnglish),
          nameCambodia: orNull(dto.nameCambodia),
          blogCategoryAID: category?.blogCategoryAID,
          slug: dto.slug,
          summary: orNull(dto.summary),
          content:
            dto.content === undefined
              ? undefined
              : dto.content
                ? sanitizeBlogHtml(dto.content)
                : null,
          thumbnailURL: orNull(dto.thumbnailURL),
          status: publishing?.status,
          publishedAt: publishing?.publishedAt,
          isFeatured: dto.isFeatured,
          metaTitle: orNull(dto.metaTitle),
          metaDescription: orNull(dto.metaDescription),
          updatedByAID: actorAID,
          note: orNull(dto.note),
        },
        include: blogInclude,
      });
      return toResponse(record, { content: true, admin: true });
    } catch (error) {
      throw this.translate(error);
    }
  }

  /** Staff may not publish, hide, schedule or feature a post. */
  private assertDraftOnly(dto: SaveBlogDto): void {
    if (
      (dto.status !== undefined && dto.status !== BlogStatus.DRAFT) ||
      dto.publishedAt !== undefined ||
      dto.isFeatured !== undefined
    ) {
      throw new ForbiddenException('Insufficient role');
    }
  }

  /**
   * PUBLISHED always carries a publishedAt (also enforced by CK_Blog_publishedAt):
   * an explicit value wins, then the existing one, otherwise "now".
   * Other statuses keep whatever value is given or already stored.
   */
  private resolvePublishing(
    status: BlogStatus,
    requested: string | null | undefined,
    existing: Date | null,
  ): { status: BlogStatus; publishedAt: Date | null } {
    const explicit: Date | null | undefined = requested
      ? new Date(requested)
      : requested === undefined
        ? undefined
        : null;
    if (explicit instanceof Date && Number.isNaN(explicit.getTime())) {
      throw new BadRequestException('publishedAt is not a valid date');
    }
    if (status === BlogStatus.PUBLISHED) {
      if (explicit === null) {
        throw new BadRequestException(
          'publishedAt is required for published blogs',
        );
      }
      return { status, publishedAt: explicit ?? existing ?? new Date() };
    }
    return {
      status,
      publishedAt: explicit === undefined ? existing : explicit,
    };
  }

  private searchFilter(search: string | undefined): Prisma.BlogWhereInput {
    if (!search) return {};
    return {
      OR: [
        { nameVietnamese: { contains: search, mode: 'insensitive' } },
        { nameEnglish: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  private async page(
    where: Prisma.BlogWhereInput,
    query: ListBlogsQueryDto,
    orderBy: Prisma.BlogOrderByWithRelationInput[],
    admin = false,
  ): Promise<BlogListResponse> {
    const { page, pageSize } = query;
    const [records, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        where,
        include: blogInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.blog.count({ where }),
    ]);
    return {
      items: records.map((record) => toResponse(record, { admin })),
      total,
      page,
      pageSize,
    };
  }

  private async getRecord(blogID: string): Promise<BlogRecord> {
    const record = await this.prisma.blog.findUnique({
      where: { blogID },
      include: blogInclude,
    });
    if (!record) throw new NotFoundException('Blog not found');
    return record;
  }

  private async getCategory(blogCategoryID: string) {
    const category = await this.prisma.blogCategory.findUnique({
      where: { blogCategoryID },
    });
    if (!category) throw new NotFoundException('Blog category not found');
    return category;
  }

  private translate(error: unknown): unknown {
    return isUniqueViolation(error)
      ? new ConflictException('Blog slug already exists')
      : error;
  }
}
