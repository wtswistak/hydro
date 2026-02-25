import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AppConfigService } from 'src/core/config/app-config.service';
import { CryptoService } from './crypto.service';
import { WalletRepository } from './wallet.repository';
import { CryptoTokenService } from 'src/modules/crypto-token/crypto-token.service';
import { BlockchainModule } from 'src/integrations/blockchain/blockchain.module';
import { EvmModule } from 'src/integrations/evm/evm.module';
import { BitcoinModule } from 'src/integrations/bitcoin/bitcoin.module';
import { BullQueueModule } from 'src/jobs/bull-mq/bull-mq.module';

@Module({
  imports: [BlockchainModule, EvmModule, BitcoinModule, BullQueueModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    AppConfigService,
    CryptoService,
    WalletRepository,
    CryptoTokenService,
  ],
  exports: [WalletService, WalletRepository, CryptoTokenService, CryptoService],
})
export class WalletModule {}
