import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CryptoService } from './crypto.service';
import { BullQueueModule } from 'src/bull-mq/bull-mq.module';
import { TransactionWorker } from 'src/bull-mq/worker/transaction.worker';

@Module({
  imports: [BullQueueModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    AppConfigService,
    BlockchainService,
    CryptoService,
    TransactionWorker,
  ],
})
export class WalletModule {}
