import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BullQueueModule } from 'src/bull-mq/bull-mq.module';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CryptoService } from 'src/wallet/crypto.service';
import { WalletService } from 'src/wallet/wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BalanceService } from 'src/balance/balance.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { TransactionWorker } from 'src/bull-mq/worker/transaction.worker';

@Module({
  imports: [BullQueueModule, CoingeckoModule, WalletModule],
  controllers: [TransactionController],
  providers: [
    AppConfigService,
    TransactionService,
    BlockchainService,
    CryptoService,
    TransactionWorker,
    WalletService,
    BalanceService,
  ],
  exports: [TransactionService, CryptoService, BlockchainService],
})
export class TransactionModule {}
