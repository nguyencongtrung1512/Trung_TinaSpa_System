import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { BranchesModule } from '../branches/branches.module.js';
import { AppointmentsController } from './appointments.controller.js';
import { AppointmentsService } from './appointments.service.js';

@Module({
  imports: [AuthModule, BranchesModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
