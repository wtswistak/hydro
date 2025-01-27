import { Module } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        baseURL: configService.binanceApiUrl,
        timeout: configService.httpTimeout,
        maxRedirects: configService.maxRedirects,
      }),
    }),
  ],
  providers: [BinanceService],
})
export class BinanceModule {}
