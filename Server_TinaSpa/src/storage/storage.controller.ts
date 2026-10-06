import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthUser } from '../auth/types/auth-user.js';
import { RoleName } from '../common/constants/roles.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CreatePresignedUploadDto, ObjectKeyDto } from './dto/storage.dto.js';
import { StorageService } from './storage.service.js';

@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('presigned-upload')
  @HttpCode(HttpStatus.OK)
  createPresignedUpload(
    @Body() dto: CreatePresignedUploadDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.storage.createPresignedUpload(dto, user);
  }

  @Get('object')
  getObject(@Query() { key }: ObjectKeyDto) {
    return this.storage.getObject(key);
  }

  @Delete('object')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteObject(@Body() { key }: ObjectKeyDto) {
    return this.storage.deleteObject(key);
  }
}
