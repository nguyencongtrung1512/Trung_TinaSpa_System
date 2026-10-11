import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BlogCategoriesService } from './blog-categories.service.js';
import { BlogCategoriesController, BlogController } from './blog.controller.js';
import { BlogService } from './blog.service.js';

@Module({
  imports: [AuthModule],
  controllers: [BlogCategoriesController, BlogController],
  providers: [BlogService, BlogCategoriesService],
})
export class BlogModule {}
