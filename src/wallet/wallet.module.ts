import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CryptoService } from './crypto.service';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';
import { WalletRepository } from './wallet.repository';

@Module({
  imports: [CoingeckoModule],
  controllers: [WalletController],
  providers: [
    WalletService,
    AppConfigService,
    BlockchainService,
    CryptoService,
    WalletRepository,
  ],
  exports: [WalletService, WalletRepository],
})
export class WalletModule {}
