import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductCategoriesService } from './product-categories.service.js';

describe('ProductCategoriesService.remove', () => {
  const prisma = {
    productCategory: { findUnique: vi.fn(), delete: vi.fn() },
    product: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  };
  let service: ProductCategoriesService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ProductCategoriesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = moduleRef.get(ProductCategoriesService);
  });

  it('rejects an unknown category', async () => {
    prisma.productCategory.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses to delete a category that still has products', async () => {
    prisma.productCategory.findUnique.mockResolvedValue({
      productCategoryAID: 'aid',
      _count: { products: 2 },
    });
    await expect(service.remove('c1')).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes an empty category together with its soft-deleted products', async () => {
    prisma.productCategory.findUnique.mockResolvedValue({
      productCategoryAID: 'aid',
      _count: { products: 0 },
    });
    await service.remove('c1');
    expect(prisma.product.deleteMany).toHaveBeenCalledWith({
      where: { productCategoryAID: 'aid', deletedAt: { not: null } },
    });
    expect(prisma.productCategory.delete).toHaveBeenCalledWith({
      where: { productCategoryAID: 'aid' },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
