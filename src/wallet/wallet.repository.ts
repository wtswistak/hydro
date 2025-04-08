import { PrismaService } from 'src/database/prisma/prisma.service';
import { Prisma, Wallet } from '@prisma/client';

export class WalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  getWalletById(
    { id }: { id: number },
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id },
    });
  }
  getWalletByAddress(
    { address }: { address: string },
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { address },
    });
  }
}
