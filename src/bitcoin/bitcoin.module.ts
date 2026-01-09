import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BitcoinService } from './bitcoin.service';
import { MempoolApiService } from './mempool-api.service';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [HttpModule],
  providers: [BitcoinService, MempoolApiService, AppConfigService],
  exports: [BitcoinService, MempoolApiService],
})
export class BitcoinModule {}

