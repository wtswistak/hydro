import { Module } from '@nestjs/common';
import { FeeSnapshotService } from './fee-snapshot.service';
import { FeeSnapshotController } from './fee-snapshot.controller';
import { AppConfigService } from 'src/core/config/app-config.service';
import { BlockchainModule } from 'src/integrations/blockchain/blockchain.module';
import { EvmModule } from 'src/integrations/evm/evm.module';

@Module({
  imports: [BlockchainModule, EvmModule],
  providers: [FeeSnapshotService, AppConfigService],
  controllers: [FeeSnapshotController],
  exports: [FeeSnapshotService, AppConfigService],
})
export class FeeSnapshotModule {}
