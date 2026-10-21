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
import { SaveProductCategoryDto } from './dto/product-category.dto.js';
import {
  ListProductsQueryDto,
  ManageProductsQueryDto,
  SaveProductDto,
} from './dto/product.dto.js';
import { ProductCategoriesService } from './product-categories.service.js';
import { ManageProducts, ViewProducts } from './products.constants.js';
import { ProductsService } from './products.service.js';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly categories: ProductCategoriesService) {}

  @Get()
  list() {
    return this.categories.list();
  }

  @Get('manage')
  @ViewProducts()
  listForManage() {
    return this.categories.listForManage();
  }

  @Post()
  @ManageProducts()
  create(
    @Body() dto: SaveProductCategoryDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.categories.create(dto, userAID);
  }

  @Patch(':productCategoryID')
  @ManageProducts()
  update(
    @Param('productCategoryID') productCategoryID: string,
    @Body() dto: SaveProductCategoryDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.categories.update(productCategoryID, dto, userAID);
  }

  @Delete(':productCategoryID')
  @ManageProducts()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('productCategoryID') productCategoryID: string) {
    return this.categories.remove(productCategoryID);
  }
}

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQueryDto) {
    return this.products.list(query);
  }

  @Get('manage')
  @ViewProducts()
  listForManage(@Query() query: ManageProductsQueryDto) {
    return this.products.listForManage(query);
  }

  @Get('manage/:productID')
  @ViewProducts()
  findForManage(@Param('productID') productID: string) {
    return this.products.findForManage(productID);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.products.findBySlug(slug);
  }

  @Post()
  @ManageProducts()
  create(@Body() dto: SaveProductDto, @CurrentUser('userAID') userAID: string) {
    return this.products.create(dto, userAID);
  }

  @Patch(':productID')
  @ManageProducts()
  update(
    @Param('productID') productID: string,
    @Body() dto: SaveProductDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.products.update(productID, dto, userAID);
  }

  @Delete(':productID')
  @ManageProducts()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('productID') productID: string,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.products.remove(productID, userAID);
  }
}
