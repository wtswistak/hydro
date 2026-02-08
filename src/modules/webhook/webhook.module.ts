import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { BalanceService } from 'src/modules/balance/balance.service';
import { CoingeckoModule } from 'src/integrations/coingecko/coingecko.module';
import { BlockchainModule } from 'src/integrations/blockchain/blockchain.module';
import { BalanceModule } from 'src/modules/balance/balance.module';
import { EvmTxDetailsRepository } from 'src/modules/transaction/repository/evm-tx-details.repository';
import { EvmModule } from 'src/integrations/evm/evm.module';

@Module({
  imports: [
    TransactionModule,
    WalletModule,
    CoingeckoModule,
    BlockchainModule,
    BalanceModule,
    EvmModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, EvmTxDetailsRepository],
})
export class WebhookModule {}
