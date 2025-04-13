import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { BalanceService } from 'src/balance/balance.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';

@Module({
  imports: [TransactionModule, WalletModule, CoingeckoModule],
  controllers: [WebhookController],
  providers: [WebhookService, BalanceService],
})
export class WebhookModule {}
