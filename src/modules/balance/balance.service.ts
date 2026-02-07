import { Injectable, Logger } from '@nestjs/common';
import { Balance, Prisma } from '@prisma/client';
import Decimal from 'decimal.js';

import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CoingeckoService } from 'src/coingecko/coingecko.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { PrismaClient } from 'src/core/database/prisma/prisma.type';
import { BalanceNotExistException } from 'src/modules/wallet/exception/balance-not-exist.exception';
import { WalletService } from 'src/modules/wallet/wallet.service';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly blockchainService: BlockchainService,
    private readonly coingeckoService: CoingeckoService,
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

  async getTotalBalanceInUsd({ userId }: { userId: number }): Promise<string> {
    this.logger.log(`Getting total balance in USD for user id: ${userId}`);

    const wallets = await this.prisma.wallet.findMany({
      where: { userId, deletedAt: null },
      include: {
        balances: {
          where: { deletedAt: null },
          include: { cryptoToken: true },
        },
      },
    });

    let totalUsd = new Decimal(0);

    for (const wallet of wallets) {
      for (const balance of wallet.balances) {
        const symbol = balance.cryptoToken.symbol.toLowerCase();
        const rate = await this.coingeckoService.getCryptocurrencyRate({
          id: symbol,
        });
        const amountInUsd = new Decimal(balance.amount.toString()).mul(rate);
        totalUsd = totalUsd.add(amountInUsd);
      }
    }

    return totalUsd.toFixed(2);
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
      amount: string;
    },
    prisma: PrismaClient = this.prisma,
  ): Promise<Balance> {
    const balance = await prisma.balance.update({
      where: { id: balanceId },
      data: {
        amount: {
          increment: amount,
        },
      },
    });

    return balance;
  }

  async upsertBalance(
    {
      walletId,
      cryptoTokenId,
      amount,
    }: {
      walletId: number;
      cryptoTokenId: number;
      amount: string;
    },
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
