import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { TransactionModule } from 'src/modules/transaction/transaction.module';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { BalanceService } from 'src/modules/balance/balance.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { BalanceModule } from 'src/modules/balance/balance.module';

@Module({
  imports: [
    TransactionModule,
    WalletModule,
    CoingeckoModule,
    BlockchainModule,
    BalanceModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
