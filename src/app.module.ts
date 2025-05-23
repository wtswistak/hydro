import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { AppConfigModule } from './config/app-config.module';
import { NotificationModule } from './notification/notification.module';
import { MailersendService } from './notification/mailersend.service';
import { BinanceModule } from './binance/binance.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { WalletModule } from './wallet/wallet.module';
import { RedisModule } from './database/redis/redis.module';
import { BullQueueModule } from './bull-mq/bull-mq.module';
import { TransactionModule } from './transaction/transaction.module';
import { BalanceModule } from './balance/balance.module';
import { WebhookModule } from './webhook/webhook.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron/cron.service';
import { FeeSnapshotModule } from './fee-snapshot/fee-snapshot.module';
import { FeePredictionModule } from './fee-prediction/fee-prediction.module';

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
  ],
  providers: [MailersendService, CronService],
})
export class AppModule {}
