import { Injectable, Logger } from '@nestjs/common';
import { MailersendService } from './mailersend.service';
import { SendVerificationEmail } from './interface/send-verification-email.interface';
import { BrevoApiService } from './brevo-api.service';

@Injectable()
export class NotificationService {
  logger = new Logger(NotificationService.name);
  constructor(
    private readonly mailersendService: MailersendService,
    private readonly brevoApiService: BrevoApiService,
  ) {}

  sendVerificationEmail({ email, token }: SendVerificationEmail) {
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
    this.mailersendService.sendEmail({
      receipent: email,
      subject: 'Verify your email',
      html: `<a href="${verificationLink}">Verify your email</a>`,
    });
  }

  async sendVerificationEmailByBrevo({ email, token }: SendVerificationEmail) {
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
    const html = `
      <h1>Hello</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify your email</a>
    `;
    await this.brevoApiService.sendEmail({
      email,
      subject: 'Verify your email',
      html,
    });
  }
}
