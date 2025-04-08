import { Injectable, Logger } from '@nestjs/common';
import {
  BlockchainService,
  EstimatedFee,
} from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { Prisma, Wallet } from '@prisma/client';
import { WalletExistsException } from './exception/wallet-exist.exception';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ChainNotExistsException } from './exception/chain-not-exists.exception';
import { WalletNotExistsException } from './exception/wallet-not-exist.exception';
import { GetEstimatedFeeDto } from './dto/get-estimated-fee.dto';
import { WalletRepository } from './wallet.repository';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private cryptoService: CryptoService,
    private walletRepository: WalletRepository,
  ) {}

  async createWallet({
    userId,
    blockchain,
  }: { userId: number } & CreateWalletDto): Promise<Wallet> {
    this.logger.log(`Checking if wallet exists for user with id: ${userId}`);
    const existingWallet = await this.getWalletByUserId({ userId });
    if (existingWallet) {
      throw new WalletExistsException();
    }

    const chain = await this.prisma.blockchain.findUnique({
      where: { name: blockchain },
    });
    if (!chain) {
      throw new ChainNotExistsException();
    }
    this.logger.log(`Creating wallet for user with id: ${userId}`);
    const blockchainWallet = this.blockchainService.createWallet();
    const encryptedKey = this.cryptoService.encrypt({
      privateKey: blockchainWallet.privateKey,
    });

    const newWallet = await this.prisma.$transaction(async (prisma) => {
      const wallet = await this.prisma.wallet.create({
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
      await this.prisma.balance.createMany({
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

  getWalletByUserId({ userId }: { userId: number }): Promise<Wallet> {
    return this.prisma.wallet.findFirst({
      where: {
        userId,
      },
    });
  }

  async getEstimatedFee({
    receiverAddress,
    amount,
  }: GetEstimatedFeeDto): Promise<EstimatedFee> {
    const estimatedFee = await this.blockchainService.estimateFee({
      receiverAddress,
      amount,
    });
    this.logger.log(`Estimated fee: ${estimatedFee}`);

    return estimatedFee;
  }

  async getWalletById(
    { id }: { id: number },
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.getWalletById({ id }, prisma);
    if (!wallet) {
      throw new WalletNotExistsException();
    }
    return wallet;
  }

  async getWalletByAddress(
    { address }: { address: string },
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<Wallet> {
    const wallet = await this.walletRepository.getWalletByAddress(
      { address },
      prisma,
    );
    if (!wallet) {
      throw new WalletNotExistsException();
    }
    return wallet;
  }
}
