import { Module } from '@nestjs/common';
import { FeeSnapshotService } from './fee-snapshot.service';
import { FeeSnapshotController } from './fee-snapshot.controller';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  providers: [FeeSnapshotService, BlockchainService, AppConfigService],
  controllers: [FeeSnapshotController],
  exports: [FeeSnapshotService, BlockchainService, AppConfigService],
})
export class FeeSnapshotModule {}
