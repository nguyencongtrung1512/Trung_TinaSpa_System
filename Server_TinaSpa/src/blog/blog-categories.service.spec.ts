import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BlogCategoriesService } from './blog-categories.service.js';

describe('BlogCategoriesService', () => {
  let service: BlogCategoriesService;
  let blogCategory: Record<
    'findMany' | 'findFirst' | 'findUnique' | 'create' | 'update' | 'delete',
    ReturnType<typeof vi.fn>
  >;

  const now = new Date();
  const record = {
    blogCategoryAID: 'c-aid',
    blogCategoryID: 'c1',
    slug: 'cham-soc-da',
    nameVietnamese: 'Chăm sóc da',
    nameEnglish: null,
    nameCambodia: null,
    description: null,
    displayOrder: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    note: 'internal',
    _count: { blogs: 0 },
  };

  beforeEach(async () => {
    blogCategory = {
      findMany: vi.fn().mockResolvedValue([record]),
      findFirst: vi.fn().mockResolvedValue(record),
      findUnique: vi.fn().mockResolvedValue(record),
      create: vi.fn().mockResolvedValue(record),
      update: vi.fn().mockResolvedValue(record),
      delete: vi.fn().mockResolvedValue(record),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogCategoriesService,
        { provide: PrismaService, useValue: { blogCategory } },
      ],
    }).compile();
    service = module.get(BlogCategoriesService);
  });

  it('finds an active category by slug without internal fields', async () => {
    const result = await service.findBySlug('cham-soc-da');

    expect(blogCategory.findFirst.mock.calls[0][0].where).toEqual({
      slug: 'cham-soc-da',
      isActive: true,
    });
    expect(result).not.toHaveProperty('note');
    expect(result).not.toHaveProperty('blogCategoryAID');

    blogCategory.findFirst.mockResolvedValueOnce(null);
    await expect(service.findBySlug('nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns management fields for a single category', async () => {
    const result = await service.findForManage('c1');
    expect(result).toMatchObject({ blogCategoryID: 'c1', note: 'internal' });
  });

  it('deletes an empty category but refuses one that still has posts', async () => {
    await service.remove('c1');
    expect(blogCategory.delete).toHaveBeenCalledWith({
      where: { blogCategoryID: 'c1' },
    });

    blogCategory.findUnique.mockResolvedValueOnce({
      ...record,
      _count: { blogs: 3 },
    });
    await expect(service.remove('c1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(blogCategory.delete).toHaveBeenCalledTimes(1);
  });

  it('maps a duplicate slug to a conflict', async () => {
    blogCategory.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.create({ nameVietnamese: 'X', slug: 'cham-soc-da' }, 'mgr'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
