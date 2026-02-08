import { Module } from '@nestjs/common';
import { FeeSnapshotService } from './fee-snapshot.service';
import { FeeSnapshotController } from './fee-snapshot.controller';
import { BlockchainService } from 'src/integrations/blockchain/blockchain.service';
import { AppConfigService } from 'src/core/config/app-config.service';
import { BlockchainModule } from 'src/integrations/blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  providers: [FeeSnapshotService, AppConfigService],
  controllers: [FeeSnapshotController],
  exports: [FeeSnapshotService, AppConfigService],
})
export class FeeSnapshotModule {}
