import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { seedCryptoToken } from './seeds/crypto-token.seed';
import { seedBlockchain } from './seeds/blockchain.seed';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const logger = new Logger('seed');
  logger.log('Start seeding...');
  await seedBlockchain(prisma);
  await seedCryptoToken(prisma);
  logger.log('Seeding completed');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
