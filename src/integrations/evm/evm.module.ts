import { Module } from '@nestjs/common';
import { EvmService } from './evm.service';
import { AppConfigService } from 'src/core/config/app-config.service';

@Module({
  providers: [EvmService, AppConfigService],
  exports: [EvmService],
})
export class EvmModule {}
