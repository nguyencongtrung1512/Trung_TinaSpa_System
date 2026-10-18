import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/types/auth-user.js';
import { RoleName } from '../common/constants/roles.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { ListUsersQueryDto } from './dto/list-users.dto.js';
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

  @Post('staff')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  createStaff(@Body() dto: CreateStaffDto, @CurrentUser() actor: AuthUser) {
    return this.usersService.createStaff(dto, actor);
  }

  @Get('admin-test')
  @Roles(RoleName.ADMIN)
  adminTest() {
    return { message: 'Admin access granted' };
  }
}
