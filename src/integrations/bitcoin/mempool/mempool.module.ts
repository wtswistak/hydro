import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppConfigModule } from 'src/core/config/app-config.module';
import { AppConfigService } from 'src/core/config/app-config.service';
import { MempoolService } from './mempool.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        baseURL: configService.mempoolApiUrl,
        timeout: configService.httpTimeout,
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [MempoolService],
  exports: [MempoolService],
})
export class MempoolModule {}
