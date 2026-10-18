import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import type { AuthUser } from '../auth/types/auth-user.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ManageCustomerServices } from './customer-services.constants.js';
import { CustomerServicesService } from './customer-services.service.js';
import {
  CreateCustomerDto,
  LookupCustomerQueryDto,
} from './dto/customer.dto.js';
import {
  AddCustomerServicesDto,
  ListCustomerServicesQueryDto,
} from './dto/customer-service.dto.js';

/** Staff tooling: find a customer by phone, create the account, record services used. */
@Controller('customers')
export class CustomersController {
  constructor(private readonly customerServices: CustomerServicesService) {}

  @Get('lookup')
  @ManageCustomerServices()
  lookup(
    @Query() query: LookupCustomerQueryDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.customerServices.lookup(query.phone, actor);
  }

  @Post()
  @ManageCustomerServices()
  create(@Body() dto: CreateCustomerDto, @CurrentUser() actor: AuthUser) {
    return this.customerServices.createCustomer(
      dto.phone,
      dto.fullName,
      actor,
    );
  }

  @Get(':userID/services')
  @ManageCustomerServices()
  list(
    @Param('userID') userID: string,
    @Query() query: ListCustomerServicesQueryDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.customerServices.listForCustomer(userID, query, actor);
  }

  @Post(':userID/services')
  @ManageCustomerServices()
  add(
    @Param('userID') userID: string,
    @Body() dto: AddCustomerServicesDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.customerServices.add(userID, dto, actor);
  }
}
