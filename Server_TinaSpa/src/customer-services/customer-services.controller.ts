import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ManageCustomerServices } from './customer-services.constants.js';
import { CustomerServicesService } from './customer-services.service.js';
import {
  ListCustomerServicesQueryDto,
  OverviewQueryDto,
  UpdateCustomerServiceDto,
} from './dto/customer-service.dto.js';

@Controller()
export class CustomerServicesController {
  constructor(private readonly customerServices: CustomerServicesService) {}

  /** Services the signed-in customer has used (own data only). */
  @Get('auth/me/services')
  @UseGuards(JwtAuthGuard)
  listMine(
    @CurrentUser('userAID') userAID: string,
    @Query() query: ListCustomerServicesQueryDto,
  ) {
    return this.customerServices.listMine(userAID, query);
  }

  /** Revenue, activity counters and latest recorded services for the staff / manager desks. */
  @Get('customer-services/overview')
  @ManageCustomerServices()
  overview(
    @Query() query: OverviewQueryDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.customerServices.overview(query.range, actor);
  }

  @Patch('customer-services/:customerServiceID')
  @ManageCustomerServices()
  update(
    @Param('customerServiceID') customerServiceID: string,
    @Body() dto: UpdateCustomerServiceDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.customerServices.update(customerServiceID, dto, actor);
  }

  @Delete('customer-services/:customerServiceID')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ManageCustomerServices()
  remove(
    @Param('customerServiceID') customerServiceID: string,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.customerServices.remove(customerServiceID, actor);
  }
}
