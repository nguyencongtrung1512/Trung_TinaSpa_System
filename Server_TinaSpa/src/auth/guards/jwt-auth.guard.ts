import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<TUser>(
    err: Error | undefined,
    user: TUser,
    info: Error | undefined,
  ): TUser {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Access token expired');
    }

    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('Missing access token');
    }

    if (err) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('Invalid access token');
    }

    return user;
  }
}
