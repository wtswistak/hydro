import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';
import { AppConfigService } from 'src/config/app-config.service';

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'REDIS_CLIENT',
          useFactory: async (configService: AppConfigService) => {
            const option: RedisOptions = {
              host: configService.redisHost,
              port: configService.redisPort,
            };
            const client = new Redis(option);
            await client.connect();
            return client;
          },
          inject: [AppConfigService],
        },
      ],
      exports: ['REDIS_CLIENT'],
    };
  }
}
