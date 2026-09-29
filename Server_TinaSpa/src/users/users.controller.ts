import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleName } from '../common/constants/roles.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('users')
export class UsersController {
  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  adminTest() {
    return { message: 'Admin access granted' };
  }
}
