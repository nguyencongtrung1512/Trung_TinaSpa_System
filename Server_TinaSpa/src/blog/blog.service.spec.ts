import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthUser } from '../auth/types/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BlogService } from './blog.service.js';

const user = (userAID: string, role: string): AuthUser => ({
  userAID,
  userID: `${userAID}-id`,
  phone: '0900000000',
  fullName: 'Test',
  isActive: true,
  roles: [role],
  branchAID: 'branch-aid',
  branchID: 'BR001',
});

const staff = user('staff-aid', 'STAFF');
const otherStaff = user('other-aid', 'STAFF');
const manager = user('manager-aid', 'MANAGER');
const admin = user('admin-aid', 'ADMIN');

const record = (over: Record<string, unknown> = {}) => ({
  blogID: 'b1',
  blogAID: 'b1-aid',
  slug: 'bai-viet',
  nameVietnamese: 'Bài viết',
  nameEnglish: null,
  nameCambodia: null,
  summary: null,
  content: null,
  thumbnailURL: null,
  status: 'DRAFT',
  publishedAt: null,
  isFeatured: false,
  viewCount: 0,
  metaTitle: null,
  metaDescription: null,
  authorAID: 'staff-aid',
  note: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  blogCategory: { blogCategoryID: 'c1', slug: 'c', nameVietnamese: 'C', nameEnglish: null, nameCambodia: null },
  author: { userID: 'staff-id', fullName: 'Staff' },
  ...over,
});

describe('BlogService roles', () => {
  let service: BlogService;
  let prisma: {
    $transaction: ReturnType<typeof vi.fn>;
    blog: Record<'create' | 'update' | 'findUnique' | 'findMany' | 'count', ReturnType<typeof vi.fn>>;
    blogCategory: { findUnique: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    prisma = {
      $transaction: vi.fn((queries: Promise<unknown>[]) => Promise.all(queries)),
      blog: {
        create: vi.fn().mockResolvedValue(record()),
        update: vi.fn().mockResolvedValue(record()),
        findUnique: vi.fn().mockResolvedValue(record()),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
      },
      blogCategory: { findUnique: vi.fn().mockResolvedValue({ blogCategoryAID: 'c-aid' }) },
    };
    const module = await Test.createTestingModule({
      providers: [BlogService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(BlogService);
  });

  const input = { nameVietnamese: 'Bài viết', slug: 'bai-viet', blogCategoryID: 'c1' };

  it('creates staff posts as drafts authored by the staff member and sanitizes content', async () => {
    await service.create({ ...input, content: '<p>hi</p><script>alert(1)</script>' }, staff);
    const data = prisma.blog.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ status: 'DRAFT', publishedAt: null, isFeatured: false, authorAID: 'staff-aid' });
    expect(data.content).toBe('<p>hi</p>');
  });

  it('rejects staff trying to publish, schedule or feature', async () => {
    for (const extra of [{ status: 'PUBLISHED' as const }, { publishedAt: '2026-10-12T00:00:00Z' }, { isFeatured: true }]) {
      await expect(service.create({ ...input, ...extra }, staff)).rejects.toBeInstanceOf(ForbiddenException);
    }
  });

  it('lets staff edit only their own drafts', async () => {
    await service.update('b1', { nameVietnamese: 'Mới' }, staff);
    expect(prisma.blog.update).toHaveBeenCalled();

    await expect(service.update('b1', { nameVietnamese: 'x' }, otherStaff)).rejects.toBeInstanceOf(ForbiddenException);

    prisma.blog.findUnique.mockResolvedValueOnce(record({ status: 'PUBLISHED', publishedAt: new Date() }));
    await expect(service.update('b1', { nameVietnamese: 'x' }, staff)).rejects.toBeInstanceOf(ForbiddenException);

    await expect(service.update('b1', { status: 'PUBLISHED' }, staff)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lets a manager publish and stamps publishedAt', async () => {
    await service.update('b1', { status: 'PUBLISHED' }, manager);
    const data = prisma.blog.update.mock.calls[0][0].data;
    expect(data.status).toBe('PUBLISHED');
    expect(data.publishedAt).toBeInstanceOf(Date);
    expect(data.updatedByAID).toBe('manager-aid');
  });

  it('refuses to publish with an explicit null publishedAt', async () => {
    await expect(
      service.update('b1', { status: 'PUBLISHED', publishedAt: null }, manager),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lets every management role read every post and filter to their own', async () => {
    const query = { page: 1, pageSize: 10 };
    await service.listForManage(query, staff);
    expect(prisma.blog.findMany.mock.calls[0][0].where).not.toHaveProperty('authorAID');
    await service.listForManage({ ...query, mine: true }, staff);
    expect(prisma.blog.findMany.mock.calls[1][0].where.authorAID).toBe('staff-aid');
    await expect(service.findForManage('b1')).resolves.toBeDefined();
  });
});
