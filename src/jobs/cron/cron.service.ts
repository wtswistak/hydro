import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BitcoinDepositScannerService } from 'src/modules/bitcoin-deposit-scanner/bitcoin-deposit-scanner.service';
import { FeeSnapshotService } from 'src/modules/fee-snapshot/fee-snapshot.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  constructor(
    private readonly feeSnapshotService: FeeSnapshotService,
    private readonly bitcoinDepositScannerService: BitcoinDepositScannerService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async scanBitcoinDeposits() {
    this.logger.log('Scanning Bitcoin deposits...');
    const startTime = Date.now();

    try {
      await this.bitcoinDepositScannerService.scanAllWallets();
      const duration = (Date.now() - startTime) / 1000;
      this.logger.log(
        `Bitcoin deposit scan completed successfully in ${duration} seconds`,
      );
    } catch (error) {
      this.logger.error('Error scanning Bitcoin deposits', error);
    }
  }

  // @Cron(CronExpression.EVERY_30_MINUTES)
  // async createFeeSnapshot() {
  //   this.logger.log('Creating fee snapshot...');
  //   const startTime = Date.now();
  //   try {
  //     await this.feeSnapshotService.createFeeSnapshotJob();
  //     const duration = (Date.now() - startTime) / 1000;
  //     this.logger.log(
  //       `Fee snapshot created successfully in ${duration} seconds`,
  //     );
  //   } catch (error) {
  //     this.logger.error('Error creating fee snapshot', error);
  //   }
  // }
}
