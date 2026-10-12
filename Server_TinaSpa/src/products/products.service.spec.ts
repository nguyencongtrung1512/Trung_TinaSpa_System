import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SaveProductDto } from './dto/product.dto.js';
import { ProductsService } from './products.service.js';

describe('ProductsService variant validation', () => {
  let service: ProductsService;

  const base: SaveProductDto = {
    nameVietnamese: 'Sản phẩm',
    slug: 'san-pham',
    productCategoryID: 'c1',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ProductsService, { provide: PrismaService, useValue: {} }],
    }).compile();
    service = moduleRef.get(ProductsService);
  });

  it('requires at least one variant on create', async () => {
    await expect(service.create(base, 'actor')).rejects.toThrow('At least one variant is required');
    await expect(service.create({ ...base, variants: [] }, 'actor')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a compare-at price lower than the price', async () => {
    await expect(
      service.create(
        {
          ...base,
          variants: [{ nameVietnamese: '100ml', price: 500000, compareAtPrice: 400000 }],
        },
        'actor',
      ),
    ).rejects.toThrow('compareAtPrice must not be lower than price');
  });

  it('rejects duplicate SKUs inside one product', async () => {
    await expect(
      service.create(
        {
          ...base,
          variants: [
            { nameVietnamese: '100ml', price: 1, sku: 'A' },
            { nameVietnamese: '150ml', price: 2, sku: 'A' },
          ],
        },
        'actor',
      ),
    ).rejects.toThrow('Variant SKU must be unique');
  });
});
