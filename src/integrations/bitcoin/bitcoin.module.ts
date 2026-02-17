import { Module } from '@nestjs/common';
import { BitcoinService } from './bitcoin.service';
import { MempoolModule } from './mempool/mempool.module';

@Module({
  imports: [MempoolModule],
  providers: [BitcoinService],
  exports: [BitcoinService],
})
export class BitcoinModule {}

