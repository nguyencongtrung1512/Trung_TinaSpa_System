import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { Roles } from '../common/decorators/roles.decorator.js';

export const PHONE_PATTERN = /^(0|\+84)\d{8,10}$/;

export const ManageCustomerServices = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.STAFF),
  );

export { normalizePhone, phoneVariants } from '../common/utils/phone.util.js';
