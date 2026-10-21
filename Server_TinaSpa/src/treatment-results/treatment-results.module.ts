import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { TreatmentResultsController } from './treatment-results.controller.js';
import { TreatmentResultsService } from './treatment-results.service.js';

@Module({
  imports: [AuthModule],
  controllers: [TreatmentResultsController],
  providers: [TreatmentResultsService],
})
export class TreatmentResultsModule {}
