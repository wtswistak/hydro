import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export async function seedCryptoToken(prisma: PrismaClient) {
  const logger = new Logger('seed');
  logger.log('Seeding CryptoToken...');

  const ethChain = await prisma.blockchain.findUnique({
    where: { name: 'Ethereum' },
  });
  
  const btcChain = await prisma.blockchain.findUnique({
    where: { name: 'Bitcoin' },
  });

  if (ethChain) {
    const ethTokens = [
      {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        contractAddress: null,
        blockchainId: ethChain.id,
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        contractAddress: '0xf08a50178dfcde18524640ea6618a1f965821715', // Sepolia USDC
        blockchainId: ethChain.id,
      },
    ];

    for (const token of ethTokens) {
      await prisma.cryptoToken.upsert({
        where: { symbol: token.symbol },
        update: {
          name: token.name,
          decimals: token.decimals,
          contractAddress: token.contractAddress,
          blockchainId: token.blockchainId,
        },
        create: {
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          contractAddress: token.contractAddress,
          blockchainId: token.blockchainId,
        },
      });
    }
  }

  if (btcChain) {
    const btcTokens = [
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8,
        blockchainId: btcChain.id,
      },
    ];

    for (const token of btcTokens) {
      await prisma.cryptoToken.upsert({
        where: { symbol: token.symbol },
        update: {
          name: token.name,
          decimals: token.decimals,
          blockchainId: token.blockchainId,
        },
        create: {
          name: token.name,
          symbol: token.symbol,
          decimals: token.decimals,
          blockchainId: token.blockchainId,
        },
      });
    }
  }
}
