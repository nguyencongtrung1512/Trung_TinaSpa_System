import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { AuthModule } from './auth/auth.module.js';
import { BlogModule } from './blog/blog.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { CustomerServicesModule } from './customer-services/customer-services.module.js';
import { ObserveModule } from './observe.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ServiceCatalogModule } from './service-catalog/service-catalog.module.js';
import { StorageModule } from './storage/storage.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ServiceCatalogModule,
    StorageModule,
    BranchesModule,
    AppointmentsModule,
    CustomerServicesModule,
    BlogModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY!,
      appSecret: process.env.OBSERVE_APP_SECRET!,
      serviceId: 'tinaspasysterm',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
