import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './core/database/prisma/prisma.module';
import { AppConfigModule } from './core/config/app-config.module';
import { NotificationModule } from './notification/notification.module';
import { MailersendService } from './notification/mailersend.service';
import { BinanceModule } from './binance/binance.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RedisModule } from './core/database/redis/redis.module';
import { BullQueueModule } from './bull-mq/bull-mq.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { BalanceModule } from './modules/balance/balance.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron/cron.service';
import { FeeSnapshotModule } from './modules/fee-snapshot/fee-snapshot.module';
import { FeePredictionModule } from './fee-prediction/fee-prediction.module';
import { BitcoinModule } from './bitcoin/bitcoin.module';

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
    FeeSnapshotModule,
    FeePredictionModule,
    BitcoinModule,
  ],
  providers: [MailersendService, CronService],
})
export class AppModule {}
