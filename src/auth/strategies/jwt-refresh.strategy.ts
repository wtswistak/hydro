import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/config/app-config.service';

const cookieExtactor: JwtFromRequestFunction = (req) => {
  return req?.cookies?.refreshToken || null;
};
// leave to refresh from token
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: cookieExtactor,
      secretOrKey: configService.refreshToken,
      passReqToCallback: true,
    });
  }

  validate(req: any, payload: any) {
    const refreshToken = req.cookies?.refreshToken;
    return { refreshToken, id: payload.sub, email: payload.email };
  }
}
