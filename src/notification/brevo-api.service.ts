import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BrevoApiService {
  private readonly logger = new Logger(BrevoApiService.name);
  constructor(private readonly httpService: HttpService) {}

  private handleError(error: any, message: string): void {
    const { status, data } = error?.response;
    if (data?.error) {
      this.logger.error(`Brevo API error in ${message}`);
      this.logger.error(`Error: ${data.error}, Status: ${status}`);
    } else {
      this.logger.error(`Unknown error:', ${error}`);
    }

    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async sendEmail({
    email,
    subject,
    html,
  }: {
    email: string;
    subject: string;
    html: string;
  }) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post('/v3/smtp/email', {
          sender: {
            email: 'noreply@example.com',
          },
          to: [
            {
              email,
            },
          ],
          subject,
          htmlContent: html,
        }),
      );
      this.logger.log(`Email sent to ${email}, subject: ${subject}`);

      return data;
    } catch (error) {
      this.handleError(error, 'sendEmail');
    }
  }
}
