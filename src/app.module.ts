import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './core/database/prisma/prisma.module';
import { AppConfigModule } from './core/config/app-config.module';
import { NotificationModule } from './modules/notification/notification.module';
import { BinanceModule } from './integrations/binance/binance.module';
import { CoingeckoModule } from './integrations/coingecko/coingecko.module';
import { BlockchainModule } from './integrations/blockchain/blockchain.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RedisModule } from './core/database/redis/redis.module';
import { BullQueueModule } from './jobs/bull-mq/bull-mq.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { BalanceModule } from './modules/balance/balance.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FeePredictionModule } from './modules/fee-prediction/fee-prediction.module';
import { BitcoinModule } from './integrations/bitcoin/bitcoin.module';
import { MarketModule } from './modules/market/market.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    AppConfigModule,
    NotificationModule,
    BinanceModule,
    CoingeckoModule,
    BlockchainModule,
    WalletModule,
    RedisModule,
    BullQueueModule,
    TransactionModule,
    BalanceModule,
    WebhookModule,
    ScheduleModule.forRoot(),
    FeePredictionModule,
    BitcoinModule,
    MarketModule,
  ],
})
export class AppModule {}
