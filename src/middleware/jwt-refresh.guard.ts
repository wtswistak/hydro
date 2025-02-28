import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  private static readonly REFRESH_THRESHOLD = 180;

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: AppConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse<Response>();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No access token provided');
    }
    const token = authHeader.substring(7);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.accessToken,
      });

      const currentTime = Math.floor(Date.now() / 1000);
      const timeToExpire = payload.exp - currentTime;
      const refreshToken = req.cookies?.refreshToken;

      console.log('time', timeToExpire);
      if (timeToExpire < JwtRefreshGuard.REFRESH_THRESHOLD && refreshToken) {
        const tokens = await this.authService.refreshToken(refreshToken);

        req.headers.authorization = `Bearer ${tokens.accessToken}`;
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        req.user = { id: payload.sub, email: payload.email };
      } else {
        req.user = { id: payload.sub, email: payload.email };
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
