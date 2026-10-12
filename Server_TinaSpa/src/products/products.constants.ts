import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { Roles } from '../common/decorators/roles.decorator.js';

export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const PRODUCT_STATUSES = Object.values(ProductStatus);

export const ProductDetailType = {
  STORY: 'STORY',
  HIGHLIGHT: 'HIGHLIGHT',
  INGREDIENT: 'INGREDIENT',
  USAGE: 'USAGE',
  NOTE: 'NOTE',
  EFFECT: 'EFFECT',
  GALLERY: 'GALLERY',
} as const;

export const PRODUCT_DETAIL_TYPES = Object.values(ProductDetailType);

export const PRODUCT_SORTS = ['newest', 'price-asc', 'price-desc'] as const;

export const MAX_PRODUCT_DETAILS = 60;

export const MAX_PRODUCT_VARIANTS = 20;

export const MAX_VARIANT_IMAGES = 10;

/** Products and their categories are maintained by manager and admin. */
export const ManageProducts = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.ADMIN, RoleName.MANAGER),
  );
