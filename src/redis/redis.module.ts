import { Global, Module } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { AppConfigModule } from 'src/config/app-config.module';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: AppConfigService) => {
        const option: RedisOptions = {
          host: configService.redisHost,
          port: configService.redisPort,
        };
        const client = new Redis(option);

        return client;
      },
      inject: [AppConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
