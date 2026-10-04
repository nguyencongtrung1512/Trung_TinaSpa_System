import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ServiceCategoriesController } from './service-categories.controller.js';
import { ServiceCategoriesService } from './service-categories.service.js';
import { ServicesController } from './services.controller.js';
import { ServicesService } from './services.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ServiceCategoriesController, ServicesController],
  providers: [ServiceCategoriesService, ServicesService],
  exports: [ServiceCategoriesService, ServicesService],
})
export class ServiceCatalogModule {}
