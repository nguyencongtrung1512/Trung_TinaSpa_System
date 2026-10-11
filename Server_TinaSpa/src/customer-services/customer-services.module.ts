import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { CustomerServicesController } from './customer-services.controller.js';
import { CustomerServicesService } from './customer-services.service.js';
import { CustomersController } from './customers.controller.js';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [CustomersController, CustomerServicesController],
  providers: [CustomerServicesService],
})
export class CustomerServicesModule {}
