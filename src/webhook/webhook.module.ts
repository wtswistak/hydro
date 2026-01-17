import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { BalanceService } from 'src/balance/balance.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { BalanceModule } from 'src/balance/balance.module';

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
