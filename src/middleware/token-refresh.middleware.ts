import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class TokenRefreshMiddleware {
  private static readonly REFRESH_THRESHOLD = 180;
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.substring(7);

      try {
        const payload = this.jwtService.decode(token);
        if (payload) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeToExpire = payload['exp'] - currentTime;
          const refreshToken = req.cookies?.refreshToken;

          if (
            timeToExpire < TokenRefreshMiddleware.REFRESH_THRESHOLD &&
            refreshToken
          ) {
            try {
              const tokens = await this.authService.refreshToken(refreshToken);
              res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
              });
              req.headers.authorization = `Bearer ${tokens.accessToken}`;
            } catch (error) {
              console.log(error);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    next();
  }
}
