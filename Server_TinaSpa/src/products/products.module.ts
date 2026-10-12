import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ProductCategoriesService } from './product-categories.service.js';
import { ProductCategoriesController, ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ProductCategoriesController, ProductsController],
  providers: [ProductsService, ProductCategoriesService],
})
export class ProductsModule {}
