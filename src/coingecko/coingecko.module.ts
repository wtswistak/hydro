import { Module } from '@nestjs/common';
import { CoingeckoController } from './coingecko.controller';
import { CoingeckoService } from './coingecko.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        baseURL: configService.coingeckoApiUrl,
        timeout: configService.httpTimeout,
        maxRedirects: configService.maxRedirects,
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [CoingeckoController],
  providers: [CoingeckoService],
})
export class CoingeckoModule {}
