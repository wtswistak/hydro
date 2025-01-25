import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailersendService } from './mailersend.service';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  providers: [AppConfigService, NotificationService, MailersendService],
  exports: [NotificationService, MailersendService],
})
export class NotificationModule {}
