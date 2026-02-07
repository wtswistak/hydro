import { Module } from '@nestjs/common';
import { FeeSnapshotService } from './fee-snapshot.service';
import { FeeSnapshotController } from './fee-snapshot.controller';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { AppConfigService } from 'src/config/app-config.service';
import { BlockchainModule } from 'src/blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [FeeSnapshotService, AppConfigService],
  controllers: [FeeSnapshotController],
  exports: [FeeSnapshotService, AppConfigService],
})
export class FeeSnapshotModule {}
