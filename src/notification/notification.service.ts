import { Injectable, Logger } from '@nestjs/common';
import { MailersendService } from './mailersend.service';
import { SendVerificationEmail } from './interface/send-verification-email.interface';

@Injectable()
export class NotificationService {
  logger = new Logger(NotificationService.name);
  constructor(private readonly mailersendService: MailersendService) {}

  sendVerificationEmail({ email, token }: SendVerificationEmail) {
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
    this.mailersendService.sendEmail({
      receipent: email,
      subject: 'Verify your email',
      html: `<a href="${verificationLink}">Verify your email</a>`,
    });
  }
}
