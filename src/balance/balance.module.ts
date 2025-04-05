import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { WalletService } from 'src/wallet/wallet.service';
import { AppConfigService } from 'src/config/app-config.service';
import { CryptoService } from 'src/wallet/crypto.service';

@Module({
  controllers: [BalanceController],
  providers: [
    BalanceService,
    PrismaService,
    BlockchainService,
    WalletService,
    AppConfigService,
    CryptoService,
  ],
})
export class BalanceModule {}
