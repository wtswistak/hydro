import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CryptoService } from './crypto.service';
import { BullQueueModule } from 'src/bull-mq/bull-mq.module';
import { TransactionWorker } from 'src/bull-mq/worker/transaction.worker';
import { CoingeckoService } from 'src/coingecko/coingecko.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [BullQueueModule, CoingeckoModule, RedisModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    AppConfigService,
    BlockchainService,
    CryptoService,
    CoingeckoService,
    TransactionWorker,
  ],
})
export class WalletModule {}
