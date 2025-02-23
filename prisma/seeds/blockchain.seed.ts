import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedBlockchain() {
  const logger = new Logger('seed');
  logger.log('Seeding Blokchain...');
  await prisma.blockchain.create({
    data: {
      name: 'Etherum',
      chainId: 1,
      nativeSymbol: 'ETH',
    },
  });
}
