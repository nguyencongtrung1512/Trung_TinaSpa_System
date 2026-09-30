import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, type User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createTokenId, hashToken } from '../common/utils/crypto.util.js';
import { asJwtExpiresIn, expiresAtFromNow } from '../common/utils/expires.util.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { JwtAccessPayload, JwtRefreshPayload } from './types/jwt-payload.js';

const BCRYPT_SALT_ROUNDS = 12;
const INVALID_CREDENTIALS = 'Invalid credentials';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    let user: User;
    try {
      user = await this.usersService.create({
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Phone number already registered');
      }
      throw error;
    }

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhone(dto.phone);
    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.getUsableRefreshToken(refreshToken);

    await this.prisma.refreshToken.update({
      where: { refreshTokenAID: storedToken.refreshTokenAID },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findByUserAID(storedToken.userAID);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(user);
  }

  async logout(refreshToken: string) {
    const storedToken = await this.getUsableRefreshToken(refreshToken);

    await this.prisma.refreshToken.update({
      where: { refreshTokenAID: storedToken.refreshTokenAID },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out' };
  }

  async me(userID: string) {
    const user = await this.usersService.findByUserID(userID);
    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    return {
      user: this.usersService.toPublicUser(user),
      roles: this.usersService.getRoleNames(user),
    };
  }

  private async buildAuthResponse(user: User) {
    const roles = this.usersService.getRoleNames(user);
    const tokens = await this.issueTokenPair(user, roles);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.usersService.toPublicUser(user),
      roles,
    };
  }

  private async issueTokenPair(user: User, roles: string[]) {
    const accessExpiresIn = asJwtExpiresIn(
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    );
    const refreshExpiresIn = asJwtExpiresIn(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    );

    const accessPayload: JwtAccessPayload = {
      sub: user.userID,
      phone: user.phone,
      roles,
    };

    const tokenId = createTokenId();
    const refreshPayload: JwtRefreshPayload = {
      sub: user.userID,
      jti: tokenId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    await this.prisma.refreshToken.create({
      data: {
        tokenJti: tokenId,
        userAID: user.userAID,
        tokenHash: hashToken(refreshToken),
        expiresAt: expiresAtFromNow(refreshExpiresIn),
      },
    });

    return { accessToken, refreshToken };
  }

  private async getUsableRefreshToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.tokenJti !== payload.jti) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    return storedToken;
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtRefreshPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
