import { Module } from '@nestjs/common';
import { BitcoinDepositScannerModule } from 'src/modules/bitcoin-deposit-scanner/bitcoin-deposit-scanner.module';
import { FeeSnapshotModule } from 'src/modules/fee-snapshot/fee-snapshot.module';
import { CronService } from './cron.service';

@Module({
  imports: [BitcoinDepositScannerModule, FeeSnapshotModule],
  providers: [CronService],
})
export class CronModule {}
