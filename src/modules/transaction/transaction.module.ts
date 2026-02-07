import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BullQueueModule } from 'src/bull-mq/bull-mq.module';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CryptoService } from 'src/modules/wallet/crypto.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { BalanceService } from 'src/modules/balance/balance.service';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { TransactionWorker } from 'src/bull-mq/worker/transaction.worker';
import { BitcoinModule } from 'src/bitcoin/bitcoin.module';
import { BlockchainModule } from 'src/blockchain/blockchain.module';
import { BalanceModule } from 'src/modules/balance/balance.module';
import { BtcTxDetailsRepository } from './repository/btc-tx-details.repository';

@Module({
  imports: [
    BullQueueModule,
    CoingeckoModule,
    WalletModule,
    BlockchainModule,
    BitcoinModule,
    BalanceModule,
  ],
  controllers: [TransactionController],
  providers: [
    AppConfigService,
    TransactionService,
    TransactionWorker,
    BtcTxDetailsRepository,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
