import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/app-config.service';
import { NotificationModule } from 'src/notification/notification.module';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    NotificationModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN,
      signOptions: { expiresIn: '1d' }, // default expiration time for access token
    }),
  ],
  providers: [AuthService, AppConfigService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
