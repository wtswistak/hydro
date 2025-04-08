import { PrismaService } from 'src/database/prisma/prisma.service';
import { Wallet } from '@prisma/client';
import { PrismaClient } from 'src/database/prisma/prisma.type';

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
}
