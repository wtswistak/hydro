import { PrismaService } from 'src/database/prisma/prisma.service';
import { Wallet } from '@prisma/client';
import { PrismaClient } from 'src/database/prisma/prisma.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  getWalletById(
    { id }: { id: number },
    prisma: PrismaClient = this.prisma,
  ): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id },
    });
  }

  getWalletByUserId({ userId }: { userId: number }) {
    return this.prisma.wallet.findFirst({
      where: { userId },
    });
  }

  getWalletByAddress(
    { address }: { address: string },
    prisma: PrismaClient = this.prisma,
  ): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { address },
    });
  }

  getWallets({ userId }: { userId: number }) {
    return this.prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        address: true,
        blockchain: {
          select: {
            id: true,
            name: true,
          },
        },
        balances: {
          select: {
            id: true,
            amount: true,
            cryptoToken: {
              select: {
                id: true,
                symbol: true,
                name: true,
                decimals: true,
              },
            },
          },
        },
      },
    });
  }

  getWalletByUserAndBlockchain({
    userId,
    blockchainId,
  }: {
    userId: number;
    blockchainId: number;
  }) {
    return this.prisma.wallet.findFirst({
      where: {
        userId,
        blockchainId,
      },
    });
  }
}
