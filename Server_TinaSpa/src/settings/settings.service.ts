import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { SavePopupBannerDto } from './dto/popup-banner.dto.js';
import {
  DEFAULT_POPUP_BANNER,
  SettingKey,
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
    const json = value as unknown as Prisma.InputJsonValue;
    await this.prisma.systemSetting.upsert({
      where: { key: SettingKey.POPUP_BANNER },
      create: {
        key: SettingKey.POPUP_BANNER,
        value: json,
        updatedByAID: actorAID,
      },
      update: { value: json, updatedByAID: actorAID },
    });
    return value;
  }
}
