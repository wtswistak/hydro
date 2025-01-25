import { Injectable, Logger } from '@nestjs/common';
import { EmailParams, MailerSend, Recipient, Sender } from 'mailersend';
import { AppConfigService } from 'src/config/app-config.service';
import { ISendEmail } from './interface/send-email.dto';

@Injectable()
export class MailersendService {
  private readonly logger = new Logger(MailersendService.name);
  constructor(private readonly configService: AppConfigService) {}

  async sendEmail({ receipent, subject, html }: ISendEmail) {
    const mailerSend = new MailerSend({
      apiKey: this.configService.mailersendApiKey,
    });
    const sentFrom = new Sender(
      `barack@${this.configService.mailersendDomain}`,
      'Barack Obama',
    );
    const receipents = [new Recipient(receipent)];
    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(receipents)
      .setSubject(subject)
      .setHtml(html);
    try {
      await mailerSend.email.send(emailParams);
      this.logger.log(`Email sent to ${receipent}, subjeect: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${receipent}`, error);
    }
  }
}
