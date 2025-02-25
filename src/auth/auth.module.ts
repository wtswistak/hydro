import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AppConfigService } from 'src/config/app-config.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    PassportModule,
    NotificationModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, AppConfigService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
