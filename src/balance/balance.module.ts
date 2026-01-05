import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CryptoService } from 'src/wallet/crypto.service';
import { WalletModule } from 'src/wallet/wallet.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { CoingeckoModule } from 'src/coingecko/coingecko.module';

@Module({
  imports: [WalletModule, TransactionModule, CoingeckoModule],
  controllers: [BalanceController],
  providers: [BalanceService, AppConfigService, CryptoService],
})
export class BalanceModule {}
