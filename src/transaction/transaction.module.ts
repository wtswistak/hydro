import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BullQueueModule } from 'src/bull-mq/bull-mq.module';
import { RedisModule } from 'src/redis/redis.module';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CryptoService } from 'src/wallet/crypto.service';
import { TransactionWorker } from 'src/bull-mq/worker/transaction.worker';
import { WalletService } from 'src/wallet/wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CoingeckoService } from 'src/coingecko/coingecko.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BalanceService } from 'src/balance/balance.service';

@Module({
  imports: [BullQueueModule, CoingeckoModule, RedisModule],
  controllers: [TransactionController],
  providers: [
    AppConfigService,
    TransactionService,
    BlockchainService,
    CryptoService,
    CoingeckoService,
    WalletService,
    TransactionWorker,
    BalanceService,
  ],
})
export class TransactionModule {}
