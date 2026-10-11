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

const guard = (...roles: RoleName[]) =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...roles));

/** Read the management lists: staff, manager and admin can all see every post. */
export const ViewBlogManagement = () =>
  guard(RoleName.ADMIN, RoleName.MANAGER, RoleName.STAFF);

/** Create / edit posts: staff write drafts, manager writes and publishes. Admin is read-only. */
export const WriteBlog = () => guard(RoleName.MANAGER, RoleName.STAFF);

/** Categories are maintained by the manager only. */
export const WriteBlogCategory = () => guard(RoleName.MANAGER);
