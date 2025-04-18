import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FeeSnapshotService } from 'src/fee-snapshot/fee-snapshot.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  constructor(private readonly feeSnapshotService: FeeSnapshotService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async createFeeSnapshot() {
    this.logger.log('Creating fee snapshot...');
    const startTime = Date.now();
    try {
      await this.feeSnapshotService.createFeeSnapshotJob();
      const duration = (Date.now() - startTime) / 1000;
      this.logger.log(
        `Fee snapshot created successfully in ${duration} seconds`,
      );
    } catch (error) {
      this.logger.error('Error creating fee snapshot', error);
    }
  }
}
