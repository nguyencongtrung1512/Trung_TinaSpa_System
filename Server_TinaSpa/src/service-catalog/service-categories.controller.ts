import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import {
  CreateServiceCategoryDto,
  ListServiceCategoriesQueryDto,
  ManageServiceCategoriesQueryDto,
  UpdateServiceCategoryDto,
} from './dto/service-category.dto.js';
import { ServiceCategoriesService } from './service-categories.service.js';
import { ManageCatalog } from './service-catalog.constants.js';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly categories: ServiceCategoriesService) {}

  @Get()
  list(@Query() query: ListServiceCategoriesQueryDto) {
    return this.categories.list(query);
  }

  @Get('manage')
  @ManageCatalog()
  listForManage(@Query() query: ManageServiceCategoriesQueryDto) {
    return this.categories.listForManage(query);
  }

  @Get('manage/:serviceCategoryID')
  @ManageCatalog()
  findForManage(@Param('serviceCategoryID') serviceCategoryID: string) {
    return this.categories.findForManage(serviceCategoryID);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categories.findBySlug(slug);
  }

  @Post()
  @ManageCatalog()
  create(
    @Body() dto: CreateServiceCategoryDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.categories.create(dto, userAID);
  }

  @Patch(':serviceCategoryID')
  @ManageCatalog()
  update(
    @Param('serviceCategoryID') serviceCategoryID: string,
    @Body() dto: UpdateServiceCategoryDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.categories.update(serviceCategoryID, dto, userAID);
  }

  @Delete(':serviceCategoryID')
  @ManageCatalog()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('serviceCategoryID') serviceCategoryID: string,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.categories.remove(serviceCategoryID, userAID);
  }
}
