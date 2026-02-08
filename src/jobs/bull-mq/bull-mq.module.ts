import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/core/config/app-config.module';
import { AppConfigService } from 'src/core/config/app-config.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        connection: {
          host: configService.redisHost,
          port: configService.redisPort,
        },
      }),
      inject: [AppConfigService],
    }),
    BullModule.registerQueue({
      name: 'transaction',
    }),
  ],
  exports: [BullModule],
})
export class BullQueueModule {}
