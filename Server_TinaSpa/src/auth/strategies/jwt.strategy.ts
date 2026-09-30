import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import type { AuthUser } from '../types/auth-user.js';
import type { JwtAccessPayload } from '../types/jwt-payload.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtAccessPayload): Promise<AuthUser> {
    const user = await this.usersService.findByUserID(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive');
    }

    return {
      userAID: user.userAID,
      userID: user.userID,
      phone: user.phone,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: this.usersService.getRoleNames(user),
    };
  }
}
