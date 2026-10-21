import {
  applyDecorators,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { SaveTreatmentResultDto } from './dto/treatment-result.dto.js';
import { TreatmentResultsService } from './treatment-results.service.js';

/** Homepage results are managed by admin and manager; staff has no access. */
const ManageTreatmentResults = () =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(RoleName.ADMIN, RoleName.MANAGER),
  );

@Controller('treatment-results')
export class TreatmentResultsController {
  constructor(private readonly results: TreatmentResultsService) {}

  @Get()
  list() {
    return this.results.list();
  }

  @Get('manage')
  @ManageTreatmentResults()
  listForManage() {
    return this.results.listForManage();
  }

  @Post()
  @ManageTreatmentResults()
  create(
    @Body() dto: SaveTreatmentResultDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.results.create(dto, userAID);
  }

  @Patch(':treatmentResultID')
  @ManageTreatmentResults()
  update(
    @Param('treatmentResultID') treatmentResultID: string,
    @Body() dto: SaveTreatmentResultDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.results.update(treatmentResultID, dto, userAID);
  }

  @Delete(':treatmentResultID')
  @ManageTreatmentResults()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('treatmentResultID') treatmentResultID: string) {
    return this.results.remove(treatmentResultID);
  }
}
