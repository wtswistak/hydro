import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailersendService } from './mailersend.service';
import { AppConfigService } from 'src/core/config/app-config.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigModule } from 'src/core/config/app-config.module';
import { BrevoApiService } from './brevo-api.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [AppConfigModule],
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
  providers: [
    AppConfigService,
    NotificationService,
    MailersendService,
    BrevoApiService,
  ],
  exports: [NotificationService, MailersendService],
})
export class NotificationModule {}
