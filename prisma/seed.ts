import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { seedCryptoToken } from './seeds/crypto-token.seed';
import { seedBlockchain } from './seeds/blockchain.seed';

const prisma = new PrismaClient();

async function main() {
  const logger = new Logger('seed');
  logger.log('Start seeding...');
  await seedBlockchain();
  await seedCryptoToken();
  logger.log('Seeding completed');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
