import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { WalletService } from 'src/wallet/wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CryptoService } from 'src/wallet/crypto.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [BalanceController],
  providers: [
    BalanceService,
    PrismaService,
    BlockchainService,
    AppConfigService,
    CryptoService,
  ],
})
export class BalanceModule {}
