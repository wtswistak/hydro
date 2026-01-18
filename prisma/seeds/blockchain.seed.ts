import { Logger } from '@nestjs/common';
import { PrismaClient, BlockchainType } from '@prisma/client';

export async function seedBlockchain(prisma: PrismaClient) {
  const logger = new Logger('seed');
  logger.log('Seeding Blokchain...');

  const ethChain = await prisma.blockchain.findUnique({
    where: { name: 'Ethereum' },
  });
  const btcChain = await prisma.blockchain.findUnique({
    where: { name: 'Bitcoin' },
  });

  if (!ethChain) {
    await prisma.blockchain.create({
      data: {
        name: 'Ethereum',
        chainId: 11155111, // Sepolia
        nativeSymbol: 'ETH',
        type: BlockchainType.EVM,
      },
    });
  }
  if (!btcChain) {
    await prisma.blockchain.create({
      data: {
        name: 'Bitcoin',
        chainId: null,
        nativeSymbol: 'BTC',
        type: BlockchainType.BITCOIN,
      },
    });
  }
}
