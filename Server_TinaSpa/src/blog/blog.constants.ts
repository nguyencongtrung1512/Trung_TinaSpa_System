import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { Roles } from '../common/decorators/roles.decorator.js';

export const BlogStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  HIDDEN: 'HIDDEN',
} as const;

export type BlogStatus = (typeof BlogStatus)[keyof typeof BlogStatus];

export const BLOG_STATUSES = Object.values(BlogStatus);

/** content is limited to stay under the 100 KB default JSON body limit with the other fields. */
export const BLOG_CONTENT_MAX_LENGTH = 80_000;

export const ManageBlog = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.ADMIN, RoleName.MANAGER),
  );
