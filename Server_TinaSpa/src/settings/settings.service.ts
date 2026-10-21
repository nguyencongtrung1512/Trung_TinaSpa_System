import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  SaveHomeProcessDto,
  SaveHomeTeamDto,
} from './dto/home-content.dto.js';
import type { SavePopupBannerDto } from './dto/popup-banner.dto.js';
import {
  DEFAULT_HOME_PROCESS,
  DEFAULT_HOME_TEAM,
  DEFAULT_POPUP_BANNER,
  SettingKey,
  type HomeProcessSetting,
  type HomeTeamSetting,
  type PopupBannerSetting,
} from './settings.constants.js';

const orNull = (value: string | null | undefined) => (value ? value : null);

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPopupBanner(): Promise<PopupBannerSetting> {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: SettingKey.POPUP_BANNER },
    });
    return {
      ...DEFAULT_POPUP_BANNER,
      ...(row?.value as Partial<PopupBannerSetting> | undefined),
    };
  }

  /** What the website sees: nothing unless the popup is switched on and has an image. */
  async getPublicPopupBanner(): Promise<PopupBannerSetting | null> {
    const banner = await this.getPopupBanner();
    return banner.enabled && banner.image ? banner : null;
  }

  async savePopupBanner(
    dto: SavePopupBannerDto,
    actorAID: string,
  ): Promise<PopupBannerSetting> {
    const value: PopupBannerSetting = {
      enabled: dto.enabled,
      image: orNull(dto.image),
      imageAlt: orNull(dto.imageAlt),
      link: orNull(dto.link),
    };
    if (value.enabled && !value.image)
      throw new BadRequestException('image is required to enable the popup');
    await this.write(SettingKey.POPUP_BANNER, value, actorAID);
    return value;
  }

  /** Homepage team cards; the built-in content until an admin saves a list. */
  async getHomeTeam(): Promise<HomeTeamSetting> {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: SettingKey.HOME_TEAM },
    });
    return (row?.value as HomeTeamSetting | undefined) ?? DEFAULT_HOME_TEAM;
  }

  async saveHomeTeam(
    dto: SaveHomeTeamDto,
    actorAID: string,
  ): Promise<HomeTeamSetting> {
    const value: HomeTeamSetting = {
      members: dto.members.map((member) => ({
        nameVietnamese: member.nameVietnamese,
        nameEnglish: orNull(member.nameEnglish),
        roleVietnamese: member.roleVietnamese,
        roleEnglish: orNull(member.roleEnglish),
        image: member.image,
      })),
    };
    await this.write(SettingKey.HOME_TEAM, value, actorAID);
    return value;
  }

  /** Homepage process steps; the built-in content until an admin saves a list. */
  async getHomeProcess(): Promise<HomeProcessSetting> {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: SettingKey.HOME_PROCESS },
    });
    return (
      (row?.value as HomeProcessSetting | undefined) ?? DEFAULT_HOME_PROCESS
    );
  }

  async saveHomeProcess(
    dto: SaveHomeProcessDto,
    actorAID: string,
  ): Promise<HomeProcessSetting> {
    const value: HomeProcessSetting = {
      steps: dto.steps.map((step) => ({
        icon: step.icon,
        titleVietnamese: step.titleVietnamese,
        titleEnglish: orNull(step.titleEnglish),
        descriptionVietnamese: step.descriptionVietnamese,
        descriptionEnglish: orNull(step.descriptionEnglish),
      })),
    };
    await this.write(SettingKey.HOME_PROCESS, value, actorAID);
    return value;
  }

  private async write(key: string, value: object, actorAID: string) {
    const json = value as Prisma.InputJsonValue;
    await this.prisma.systemSetting.upsert({
      where: { key },
      create: { key, value: json, updatedByAID: actorAID },
      update: { value: json, updatedByAID: actorAID },
    });
  }
}
