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
  get binanceApiUrl(): string {
    return this.configService.get<string>('BINANCE_API_URL');
  }
  get httpTimeout(): number {
    return this.configService.get<number>('HTTP_TIMEOUT');
  }
  get maxRedirects(): number {
    return this.configService.get<number>('MAX_REDIRECTS');
  }
  get coingeckoApiUrl(): string {
    return this.configService.get<string>('COINGECKO_API_URL');
  }
  get ethNodeUrl(): string {
    return this.configService.get<string>('ETH_NODE_URL');
  }
  get privateKey(): string {
    return this.configService.get<string>('PRIVATE_KEY');
  }
  get cryptoKey(): string {
    return this.configService.get<string>('CRYPTO_KEY');
  }
  get refreshToken(): string {
    return this.configService.get<string>('REFRESH_TOKEN');
  }
  get accessToken(): string {
    return this.configService.get<string>('ACCESS_TOKEN');
  }
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST');
  }
  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT');
  }
  get feePredictionApiUrl(): string {
    return this.configService.get<string>('FEE_PREDICTION_API_URL');
  }
  get feePredictionApiKey(): string {
    return this.configService.get<string>('FEE_PREDICTION_API_KEY');
  }
  get brevoApiUrl(): string {
    return this.configService.get<string>('BREVO_API_URL');
  }
  get brevoApiKey(): string {
    return this.configService.get<string>('BREVO_API_KEY');
  }
}
