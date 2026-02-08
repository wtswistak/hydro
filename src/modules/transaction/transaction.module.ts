import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { BullQueueModule } from 'src/jobs/bull-mq/bull-mq.module';
import { CryptoService } from 'src/modules/wallet/crypto.service';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { AppConfigService } from 'src/core/config/app-config.service';
import { CoingeckoModule } from 'src/integrations/coingecko/coingecko.module';
import { BalanceService } from 'src/modules/balance/balance.service';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { TransactionWorker } from 'src/jobs/bull-mq/worker/transaction.worker';
import { BitcoinModule } from 'src/integrations/bitcoin/bitcoin.module';
import { BlockchainModule } from 'src/integrations/blockchain/blockchain.module';
import { BalanceModule } from 'src/modules/balance/balance.module';
import { BtcTxDetailsRepository } from './repository/btc-tx-details.repository';
import { EvmTxDetailsRepository } from './repository/evm-tx-details.repository';
import { EvmModule } from 'src/integrations/evm/evm.module';

@Module({
  imports: [
    BullQueueModule,
    CoingeckoModule,
    WalletModule,
    BlockchainModule,
    BitcoinModule,
    BalanceModule,
    EvmModule,
  ],
  controllers: [TransactionController],
  providers: [
    AppConfigService,
    TransactionService,
    TransactionWorker,
    BtcTxDetailsRepository,
    EvmTxDetailsRepository,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
