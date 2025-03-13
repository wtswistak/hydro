import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';
import { RedisModule } from 'src/redis/redis.module';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule, AppConfigModule],
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
})
export class BullQueueModule {}
