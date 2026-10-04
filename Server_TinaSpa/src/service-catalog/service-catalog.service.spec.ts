import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ServiceCategoriesService } from './service-categories.service.js';
import { ServicesService } from './services.service.js';

describe('Service catalog', () => {
  let categoriesService: ServiceCategoriesService;
  let servicesService: ServicesService;
  let prisma: {
    serviceCategory: Record<'findMany' | 'findFirst' | 'create' | 'update', ReturnType<typeof vi.fn>>;
    service: Record<'findMany' | 'findFirst' | 'create' | 'update' | 'count', ReturnType<typeof vi.fn>>;
  };

  const now = new Date();

  const category = {
    serviceCategoryAID: '20261004000101',
    serviceCategoryID: '20261004000202',
    nameVietnamese: 'Gói Combo',
    nameEnglish: 'Combo Packages',
    nameCambodia: null,
    slug: 'combo',
    descriptionVietnamese: null,
    descriptionEnglish: null,
    descriptionCambodia: null,
    icon: null,
    image: '/images/p1.png',
    imageAlt: null,
    isFeatured: false,
    isBookable: true,
    sortOrder: 1,
    status: 'ACTIVE',
    createdAt: now,
    createdByAID: null,
    updatedAt: now,
    updatedByAID: null,
    deletedAt: null,
    note: null,
  };

  const service = (overrides: Record<string, unknown> = {}) => ({
    serviceAID: '20261004000303',
    serviceID: '20261004000404',
    nameVietnamese: 'Perfectly Polished',
    nameEnglish: 'Perfectly Polished',
    nameCambodia: null,
    serviceCategoryAID: category.serviceCategoryAID,
    slug: 'perfectly-polished',
    shortDescriptionVietnamese: null,
    shortDescriptionEnglish: null,
    shortDescriptionCambodia: null,
    descriptionVietnamese: null,
    descriptionEnglish: null,
    descriptionCambodia: null,
    price: new Prisma.Decimal(390000),
    durationMinutes: null,
    image: null,
    imageAlt: null,
    isBookable: true,
    sortOrder: 1,
    status: 'ACTIVE',
    createdAt: now,
    createdByAID: null,
    updatedAt: now,
    updatedByAID: null,
    deletedAt: null,
    note: null,
    ...overrides,
  });

  const uniqueViolation = () =>
    new Prisma.PrismaClientKnownRequestError('Unique constraint', {
      code: 'P2002',
      clientVersion: '6.0.0',
    });

  beforeEach(async () => {
    prisma = {
      serviceCategory: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      service: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceCategoriesService,
        ServicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    categoriesService = module.get(ServiceCategoriesService);
    servicesService = module.get(ServicesService);
  });

  describe('ServiceCategoriesService', () => {
    it('lists categories with service count and minimum price, without AIDs', async () => {
      prisma.serviceCategory.findMany.mockResolvedValue([
        {
          ...category,
          services: [service(), service({ slug: 'glow-relax', price: new Prisma.Decimal(590000) })],
        },
      ]);

      const [result] = await categoriesService.list({});

      expect(result).toMatchObject({ slug: 'combo', serviceCount: 2, minPrice: 390000 });
      expect(result).not.toHaveProperty('serviceCategoryAID');
      expect(result).not.toHaveProperty('services');
      expect(prisma.serviceCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE', deletedAt: null },
        }),
      );
    });

    it('includes services when requested', async () => {
      prisma.serviceCategory.findMany.mockResolvedValue([{ ...category, services: [service()] }]);

      const [result] = await categoriesService.list({ includeServices: true });

      expect(result.services).toHaveLength(1);
      expect(result.services?.[0]).not.toHaveProperty('serviceAID');
      expect(result.services?.[0].price).toBe(390000);
    });

    it('returns 409 when the slug already exists', async () => {
      prisma.serviceCategory.create.mockRejectedValue(uniqueViolation());

      await expect(
        categoriesService.create({ nameVietnamese: 'Gói Combo', slug: 'combo' }, 'admin-aid'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('refuses to delete a category that still has services', async () => {
      prisma.serviceCategory.findFirst.mockResolvedValue(category);
      prisma.service.count.mockResolvedValue(3);

      await expect(categoriesService.remove(category.serviceCategoryID, 'admin-aid')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.serviceCategory.update).not.toHaveBeenCalled();
    });

    it('soft deletes an empty category', async () => {
      prisma.serviceCategory.findFirst.mockResolvedValue(category);
      prisma.service.count.mockResolvedValue(0);

      await categoriesService.remove(category.serviceCategoryID, 'admin-aid');

      expect(prisma.serviceCategory.update).toHaveBeenCalledWith({
        where: { serviceCategoryAID: category.serviceCategoryAID },
        data: { deletedAt: expect.any(Date), updatedByAID: 'admin-aid' },
      });
    });
  });

  describe('ServicesService', () => {
    it('creates a service under the category resolved from its Business ID', async () => {
      prisma.serviceCategory.findFirst.mockResolvedValue(category);
      prisma.service.create.mockResolvedValue({ ...service(), serviceCategory: category });

      const result = await servicesService.create(
        {
          nameVietnamese: 'Perfectly Polished',
          serviceCategoryID: category.serviceCategoryID,
          slug: 'perfectly-polished',
          price: 390000,
        },
        'admin-aid',
      );

      expect(prisma.service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            serviceCategoryAID: category.serviceCategoryAID,
            createdByAID: 'admin-aid',
            updatedByAID: 'admin-aid',
          }),
        }),
      );
      expect(prisma.service.create.mock.calls[0][0].data).not.toHaveProperty('serviceCategoryID');
      expect(result.category?.slug).toBe('combo');
    });

    it('returns 404 when the category does not exist', async () => {
      prisma.serviceCategory.findFirst.mockResolvedValue(null);

      await expect(
        servicesService.create(
          { nameVietnamese: 'X', serviceCategoryID: 'missing', slug: 'x', price: 1 },
          'admin-aid',
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('searches every language field case-insensitively', async () => {
      prisma.service.findMany.mockResolvedValue([]);

      await servicesService.list({ search: 'gel', category: 'manicure' });

      const where = prisma.service.findMany.mock.calls[0][0].where;
      expect(where.serviceCategory).toMatchObject({ slug: 'manicure', status: 'ACTIVE' });
      expect(where.OR).toHaveLength(9);
      expect(where.OR[0]).toEqual({ nameVietnamese: { contains: 'gel', mode: 'insensitive' } });
    });

    it('returns 404 for unknown public slugs', async () => {
      prisma.service.findFirst.mockResolvedValue(null);

      await expect(servicesService.findBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
