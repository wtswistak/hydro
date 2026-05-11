import { Module } from '@nestjs/common';
import { BitcoinModule } from 'src/integrations/bitcoin/bitcoin.module';
import { BitcoinDepositScannerService } from './bitcoin-deposit-scanner.service';

@Module({
  imports: [BitcoinModule],
  providers: [BitcoinDepositScannerService],
  exports: [BitcoinDepositScannerService],
})
export class BitcoinDepositScannerModule {}
