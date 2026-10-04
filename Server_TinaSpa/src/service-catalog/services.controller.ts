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
  CreateServiceDto,
  ListServicesQueryDto,
  ManageServicesQueryDto,
  UpdateServiceDto,
} from './dto/service.dto.js';
import { ManageCatalog } from './service-catalog.constants.js';
import { ServicesService } from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  list(@Query() query: ListServicesQueryDto) {
    return this.services.list(query);
  }

  @Get('manage')
  @ManageCatalog()
  listForManage(@Query() query: ManageServicesQueryDto) {
    return this.services.listForManage(query);
  }

  @Get('manage/:serviceID')
  @ManageCatalog()
  findForManage(@Param('serviceID') serviceID: string) {
    return this.services.findForManage(serviceID);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.services.findBySlug(slug);
  }

  @Post()
  @ManageCatalog()
  create(@Body() dto: CreateServiceDto, @CurrentUser('userAID') userAID: string) {
    return this.services.create(dto, userAID);
  }

  @Patch(':serviceID')
  @ManageCatalog()
  update(
    @Param('serviceID') serviceID: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.services.update(serviceID, dto, userAID);
  }

  @Delete(':serviceID')
  @ManageCatalog()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('serviceID') serviceID: string,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.services.remove(serviceID, userAID);
  }
}
