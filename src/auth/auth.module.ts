import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/app-config.service';
import { NotificationModule } from 'src/notification/notification.module';
import { JwtRefreshGuard } from 'src/middleware/jwt-refresh.guard';

@Module({
  imports: [
    PassportModule,
    NotificationModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, AppConfigService, JwtRefreshGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, JwtRefreshGuard, AppConfigService],
})
export class AuthModule {}
