import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleName } from '../common/constants/roles.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { SaveHomeProcessDto, SaveHomeTeamDto } from './dto/home-content.dto.js';
import { SavePopupBannerDto } from './dto/popup-banner.dto.js';
import { SettingsService } from './settings.service.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** Public: the popup to show on the website; `banner` is null when it is off. */
  @Get('popup-banner')
  async getPublicPopupBanner() {
    return { banner: await this.settings.getPublicPopupBanner() };
  }

  @Get('popup-banner/manage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  getPopupBanner() {
    return this.settings.getPopupBanner();
  }

  @Put('popup-banner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  savePopupBanner(
    @Body() dto: SavePopupBannerDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.settings.savePopupBanner(dto, userAID);
  }

  /** Public: the homepage "Người đồng hành cùng bạn" cards. */
  @Get('home-team')
  getHomeTeam() {
    return this.settings.getHomeTeam();
  }

  @Put('home-team')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  saveHomeTeam(
    @Body() dto: SaveHomeTeamDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.settings.saveHomeTeam(dto, userAID);
  }

  /** Public: the homepage "Quy trình làm việc" steps. */
  @Get('home-process')
  getHomeProcess() {
    return this.settings.getHomeProcess();
  }

  @Put('home-process')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  saveHomeProcess(
    @Body() dto: SaveHomeProcessDto,
    @CurrentUser('userAID') userAID: string,
  ) {
    return this.settings.saveHomeProcess(dto, userAID);
  }
}
