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
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/types/auth-user.js';
import { RoleName } from '../common/constants/roles.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { ListUsersQueryDto } from './dto/list-users.dto.js';
import { UpdateStaffDto, UpdateUserStatusDto } from './dto/update-staff.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.STAFF)
  list(@Query() query: ListUsersQueryDto, @CurrentUser() actor: AuthUser) {
    return this.usersService.list(query, actor);
  }

  /** Trang chi tiết: thông tin, dịch vụ và lịch hẹn của một tài khoản trong phạm vi được xem. */
  @Get(':userID/detail')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.STAFF)
  detail(@Param('userID') userID: string, @CurrentUser() actor: AuthUser) {
    return this.usersService.getDetail(userID, actor);
  }

  @Post('staff')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  createStaff(@Body() dto: CreateStaffDto, @CurrentUser() actor: AuthUser) {
    return this.usersService.createStaff(dto, actor);
  }

  @Patch(':userID')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  updateStaff(
    @Param('userID') userID: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.usersService.updateStaff(userID, dto, actor);
  }

  @Patch(':userID/status')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  setStatus(
    @Param('userID') userID: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.usersService.setActive(userID, dto.isActive, actor);
  }

  @Delete(':userID')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('userID') userID: string, @CurrentUser() actor: AuthUser) {
    return this.usersService.remove(userID, actor);
  }

  @Get('admin-test')
  @Roles(RoleName.ADMIN)
  adminTest() {
    return { message: 'Admin access granted' };
  }
}
