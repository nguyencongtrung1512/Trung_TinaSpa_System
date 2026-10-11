import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
  lookup(@Query() query: LookupCustomerQueryDto) {
    return this.customerServices.lookup(query.phone);
  }

  @Post()
  @ManageCustomerServices()
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser('userAID') actorAID: string,
  ) {
    return this.customerServices.createCustomer(
      dto.phone,
      dto.fullName,
      actorAID,
    );
  }

  @Get(':userID/services')
  @ManageCustomerServices()
  list(
    @Param('userID') userID: string,
    @Query() query: ListCustomerServicesQueryDto,
  ) {
    return this.customerServices.listForCustomer(userID, query);
  }

  @Post(':userID/services')
  @ManageCustomerServices()
  add(
    @Param('userID') userID: string,
    @Body() dto: AddCustomerServicesDto,
    @CurrentUser('userAID') actorAID: string,
  ) {
    return this.customerServices.add(userID, dto, actorAID);
  }
}
