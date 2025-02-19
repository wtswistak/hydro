import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCryptoToken() {
  const logger = new Logger('seed');
  logger.log('Seeding CryptoToken...');

  const blockchain = await prisma.blockchain.findUnique({
    where: { chainId: 1 },
  });
  await prisma.cryptoToken.create({
    data: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 8,
      blockchainId: blockchain.id,
    },
  });
}
