import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { AppConfigService } from 'src/core/config/app-config.service';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { CoingeckoModule } from 'src/integrations/coingecko/coingecko.module';
import { BlockchainModule } from 'src/integrations/blockchain/blockchain.module';
import { EvmModule } from 'src/integrations/evm/evm.module';

@Module({
  imports: [WalletModule, CoingeckoModule, BlockchainModule, EvmModule],
  controllers: [BalanceController],
  providers: [BalanceService, AppConfigService],
  exports: [BalanceService],
})
export class BalanceModule {}
