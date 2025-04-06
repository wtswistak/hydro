import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { WalletService } from 'src/wallet/wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  controllers: [BalanceController],
  providers: [BalanceService, AppConfigService, WalletService],
})
export class BalanceModule {}
