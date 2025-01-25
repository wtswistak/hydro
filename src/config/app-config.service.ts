import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT');
  }
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV');
  }
  get apiKey(): string {
    return this.configService.get<string>('API_KEY');
  }
  get mailersendApiKey(): string {
    return this.configService.get<string>('MAILERSEND_API_KEY');
  }
  get mailersendApiUrl(): string {
    return this.configService.get<string>('MAILERSEND_API_URL');
  }
  get mailersendDomain(): string {
    return this.configService.get<string>('MAILERSEND_DOMAIN');
  }
}
