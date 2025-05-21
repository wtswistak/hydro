import { Module } from '@nestjs/common';
import { FeePredictionController } from './fee-prediction.controller';
import { FeePredictionService } from './fee-prediction.service';
import { FeeSnapshotModule } from 'src/fee-snapshot/fee-snapshot.module';
import { HttpModule } from '@nestjs/axios';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';
import { FeePredictionApiService } from './fee-prediction-api.service';

@Module({
  imports: [
    FeeSnapshotModule,
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        baseURL: configService.feePredictionApiUrl,
        timeout: configService.httpTimeout,
        maxRedirects: configService.maxRedirects,
        headers: {
          'x-api-key': configService.feePredictionApiKey,
        },
      }),
      inject: [AppConfigService],
    }),
  ],
  controllers: [FeePredictionController],
  providers: [FeePredictionService, FeePredictionApiService],
})
export class FeePredictionModule {}
