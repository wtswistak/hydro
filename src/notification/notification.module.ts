import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailersendService } from './mailersend.service';
import { AppConfigService } from 'src/config/app-config.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [AppConfigService],
      useFactory: async (configService: AppConfigService) => ({
        baseURL: configService.brevoApiUrl,
        timeout: configService.httpTimeout,
        maxRedirects: configService.maxRedirects,
        headers: {
          'api-key': configService.brevoApiKey,
          'Content-Type': 'application/json',
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AppConfigService, NotificationService, MailersendService],
  exports: [NotificationService, MailersendService],
})
export class NotificationModule {}
