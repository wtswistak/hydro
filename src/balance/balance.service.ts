import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BalanceNotExistException } from 'src/wallet/exception/balance-not-exist.exception';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async getBalance({ userId }: { userId: number }): Promise<string> {
    this.logger.log(`Getting balance for user with id: ${userId}`);
    const wallet = await this.walletService.getWalletByUserId({ userId });
    const balance = this.blockchainService.getBalance({
      address: wallet.address,
    });

    if (!balance) {
      throw new BalanceNotExistException();
    }

    return balance;
  }
}
