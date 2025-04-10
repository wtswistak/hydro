import { Injectable, Logger } from '@nestjs/common';
import { Balance, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PrismaClient } from 'src/database/prisma/prisma.type';
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

  async getBalanceByWalletId(
    {
      walletId,
      cryptoTokenId,
    }: {
      walletId: number;
      cryptoTokenId: number;
    },
    prisma: PrismaClient = this.prisma,
  ): Promise<Balance> {
    this.logger.log(`Getting balance for wallet with id: ${walletId}`);
    const balance = await prisma.balance.findUnique({
      where: {
        walletId_cryptoTokenId: {
          walletId,
          cryptoTokenId,
        },
      },
    });

    if (!balance) {
      throw new BalanceNotExistException();
    }

    return balance;
  }

  async updateBalance(
    {
      balanceId,
      amount,
    }: {
      balanceId: number;
      amount: number;
    },
    prisma: PrismaClient = this.prisma,
  ): Promise<Balance> {
    const balance = await prisma.balance.update({
      where: { id: balanceId },
      data: {
        amount: {
          increment: new Decimal(amount),
        },
      },
    });

    return balance;
  }

  async upsertBalance(
    { walletId, cryptoTokenId, amount }: Partial<Balance>,
    prisma: PrismaClient = this.prisma,
  ): Promise<Balance> {
    this.logger.log(`Upserting balance for wallet with id: ${walletId}`);
    const balance = await prisma.balance.upsert({
      where: {
        walletId_cryptoTokenId: {
          walletId,
          cryptoTokenId,
        },
      },
      update: {
        amount: {
          increment: amount,
        },
      },
      create: {
        walletId,
        cryptoTokenId,
        amount,
      },
    });

    return balance;
  }
}
