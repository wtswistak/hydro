import { Injectable, Logger } from '@nestjs/common';
import {
  BlockchainService
} from 'src/integrations/blockchain/blockchain.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { Prisma, Wallet } from '@prisma/client';
import { WalletExistsException } from './exception/wallet-exist.exception';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ChainNotExistsException } from './exception/chain-not-exists.exception';
import { WalletNotExistsException } from './exception/wallet-not-exist.exception';
import { GetEstimatedFeeDto } from './dto/get-estimated-fee.dto';
import { WalletRepository } from './wallet.repository';
import { PrismaClient } from 'src/core/database/prisma/prisma.type';
import { CryptoTokenService } from 'src/modules/crypto-token/crypto-token.service';
import { CryptoTokenNotExistException } from 'src/modules/crypto-token/exception/token-not-exist.exceptions';
import { EstimatedFee } from 'src/integrations/evm/types/evm.types';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private cryptoService: CryptoService,
    private walletRepository: WalletRepository,
    private cryptoTokenService: CryptoTokenService,
  ) {}

  async createWallet({
    userId,
    blockchain,
  }: { userId: number } & CreateWalletDto): Promise<Wallet> {
    const chain = await this.prisma.blockchain.findUnique({
      where: { name: blockchain },
    });
    if (!chain) {
      throw new ChainNotExistsException();
    }

    this.logger.log(
      `Checking if wallet exists for user with id: ${userId} and blockchain: ${blockchain}`,
    );
    const existingWallet =
      await this.walletRepository.getWalletByUserAndBlockchain({
        userId,
        blockchainId: chain.id,
      });

    if (existingWallet) {
      throw new WalletExistsException();
    }

    this.logger.log(`Creating wallet for user with id: ${userId}`);
    const blockchainWallet = this.blockchainService.createWallet(chain.type);
    const encryptedKey = this.cryptoService.encrypt({
      privateKey: blockchainWallet.privateKey,
    });

    const newWallet = await this.prisma.$transaction(async (prisma) => {
      const wallet = await prisma.wallet.create({
        data: {
          address: blockchainWallet.address,
          privateKey: encryptedKey,
          blockchainId: chain.id,
          userId,
        },
      });
      this.logger.log(`Wallet created with id: ${wallet.id}`);
      const cryptoTokens = await prisma.cryptoToken.findMany({
        where: { blockchainId: chain.id },
      });

      this.logger.log(`Creating balance for wallet with id: ${wallet.id}`);
      await prisma.balance.createMany({
        data: cryptoTokens.map((token) => ({
          walletId: wallet.id,
          cryptoTokenId: token.id,
          amount: 0,
        })),
      });
      this.logger.log(`Balances created for wallet with id: ${wallet.id}`);

      return wallet;
    });

    return newWallet;
  }

  async createAllWallets(userId: number, prismaTx: PrismaClient = this.prisma) {
    this.logger.log(`Starting optimized wallet creation for user: ${userId}`);

    const blockchains = await prismaTx.blockchain.findMany({
      include: {
        cryptoTokens: true,
      },
    });

    const existingBlockchainIds =
      await this.walletRepository.getBlockchainIdsWithWallet(
        { userId },
        prismaTx,
      );

    // Filter out blockchains that already have a wallet
    const chainsToCreate = blockchains.filter(
      (chain) => !existingBlockchainIds.includes(chain.id),
    );

    if (chainsToCreate.length === 0) {
      this.logger.log(`All wallets already exist for user: ${userId}`);
      return [];
    }

    this.logger.log(
      `Creating wallets for chains: ${chainsToCreate.map((c) => c.name).join(', ')}`,
    );

    const createdWallets: Wallet[] = [];

    for (const chain of chainsToCreate) {
      const blockchainWallet = this.blockchainService.createWallet(chain.type);
      const encryptedKey = this.cryptoService.encrypt({
        privateKey: blockchainWallet.privateKey,
      });

      const wallet = await prismaTx.wallet.create({
        data: {
          address: blockchainWallet.address,
          privateKey: encryptedKey,
          blockchainId: chain.id,
          userId,
        },
      });

      if (chain.cryptoTokens.length > 0) {
        await prismaTx.balance.createMany({
          data: chain.cryptoTokens.map((token) => ({
            walletId: wallet.id,
            cryptoTokenId: token.id,
            amount: 0,
          })),
        });
      }

      createdWallets.push(wallet);
    }

    this.logger.log(`Successfully created ${createdWallets.length} wallets`);
    return createdWallets;
  }

  async getEstimatedFee({
    receiverAddress,
    amount,
    cryptoSymbol,
    userId,
  }: GetEstimatedFeeDto & { userId: number }): Promise<EstimatedFee> {
    const cryptoToken = await this.cryptoTokenService.getCryptoTokenBySymbol({
      symbol: cryptoSymbol,
    });
    this.logger.log(`Getting estimated fee for ${cryptoSymbol}`);

    if (!cryptoToken) {
      throw new CryptoTokenNotExistException();
    }

    const wallet = await this.walletRepository.getWalletByUserAndBlockchain({
      userId,
      blockchainId: cryptoToken.blockchainId,
    });

    if (!wallet) {
      throw new WalletNotExistsException();
    }

    const blockchain = await this.prisma.blockchain.findUnique({
      where: { id: cryptoToken.blockchainId },
    });

    const estimatedFee = await this.blockchainService.estimateFee({
      receiverAddress,
      amount,
      contractAddress: cryptoToken.contractAddress,
      decimals: cryptoToken.decimals,
      senderAddress: wallet.address,
      type: blockchain.type,
    });

    this.logger.log(
      `Estimated fee for ${cryptoSymbol}: ${estimatedFee.feeInCrypto}`,
    );

    return estimatedFee;
  }

  async getWalletById(
    { id }: { id: number },
    prisma: PrismaClient = this.prisma,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.getWalletById({ id }, prisma);
    if (!wallet) {
      throw new WalletNotExistsException();
    }
    return wallet;
  }

  async getWalletByAddress(
    { address }: { address: string },
    prisma: PrismaClient = this.prisma,
  ): Promise<Wallet> {
    return this.walletRepository.getWalletByAddress({ address }, prisma);
  }

  async getWalletByUserId({ userId }: { userId: number }): Promise<Wallet> {
    const wallet = await this.walletRepository.getWalletByUserId({ userId });
    if (!wallet) {
      throw new WalletNotExistsException();
    }
    return wallet;
  }

  async getWallets({ userId }: { userId: number }) {
    this.logger.log(`Getting wallets for user with id: ${userId}`);
    return this.walletRepository.getWallets({ userId });
  }
}
