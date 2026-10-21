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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { BranchesService } from './branches.service.js';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  list() {
    return this.branches.list();
  }

  /** Mọi chi nhánh (kể cả tạm ngưng) kèm số nhân sự, khách và lịch sắp tới. Chỉ ADMIN. */
  @Get('manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  listForManage() {
    return this.branches.listForManage();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  create(
    @Body() dto: CreateBranchDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.branches.create(dto, userAID);
  }

  @Patch(':branchID')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  update(
    @Param('branchID') branchID: string,
    @Body() dto: UpdateBranchDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.branches.update(branchID, dto, userAID);
  }

  @Delete(':branchID')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('branchID') branchID: string,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.branches.remove(branchID, userAID);
  }
}
