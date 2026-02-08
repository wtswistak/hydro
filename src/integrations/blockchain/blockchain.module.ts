import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { AppConfigService } from 'src/core/config/app-config.service';
import { BitcoinModule } from 'src/integrations/bitcoin/bitcoin.module';
import { EvmModule } from 'src/integrations/evm/evm.module';

@Module({
  imports: [BitcoinModule, EvmModule],
  providers: [BlockchainService, AppConfigService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
