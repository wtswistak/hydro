import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCryptoToken() {
  const logger = new Logger('seed');
  logger.log('Seeding CryptoToken...');

  const blockchain = await prisma.blockchain.findUnique({
    where: { chainId: 1 },
  });
  await prisma.cryptoToken.createMany({
    data: [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        blockchainId: blockchain.id,
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        contractAddress: '0xf08a50178dfcde18524640ea6618a1f965821715', // Sepolia USDC
        blockchainId: blockchain.id,
      },
    ],
    skipDuplicates: true,
  });
}
