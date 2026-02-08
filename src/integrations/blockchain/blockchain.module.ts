import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { AppConfigService } from 'src/core/config/app-config.service';
import { BitcoinModule } from 'src/integrations/bitcoin/bitcoin.module';

@Module({
  imports: [BitcoinModule],
  providers: [BlockchainService, AppConfigService],
  controllers: [BlockchainController],
  exports: [BlockchainService],
})
export class BlockchainModule {}
