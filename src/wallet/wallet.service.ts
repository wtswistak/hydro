import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { Wallet } from '@prisma/client';
import { WalletExistsException } from './exception/wallet-exist.exception';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { CreateTxDto } from './dto/create-tx.dto';
import { ChainNotExistsException } from './exception/chain-not-exists.exception';
import { BalanceNotExistException } from './exception/balance-not-exist.exception';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private cryptoService: CryptoService,
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

  async getBalance({ userId }: { userId: number }): Promise<string> {
    const wallet = await this.getWalletByUserId({ userId });
    const balance = this.blockchainService.getBalance({
      address: wallet.address,
    });

    return balance;
  }

  getWalletById({ walletId }: { walletId: number }): Promise<Wallet> {
    return this.prisma.wallet.findUnique({
      where: { id: walletId },
    });
  }

  async createTransaction({
    userId,
    receiverAddress,
    balanceId,
    amount,
  }: { userId: number } & CreateTxDto) {
    this.logger.log(
      `Creating transaction for user with id: ${userId}, receiverAddress: ${receiverAddress}, amount: ${amount}`,
    );
    const prismaTx = this.prisma.$transaction(async (prismaTx) => {
      const balance = await prismaTx.balance.findUnique({
        where: { id: balanceId },
      });
      if (!balance) {
        throw new BalanceNotExistException();
      }
      const wallet = await prismaTx.wallet.findUnique({
        where: { id: balance.walletId },
      });
      const decryptedPrivateKey = this.cryptoService.decrypt({
        encryptedKey: wallet.privateKey,
      });
      const blockchainTx = await this.blockchainService.sendTransaction({
        receiverAddress,
        amount,
        privateKey: decryptedPrivateKey,
      });
      this.logger.log(
        `Transaction created in blockchain with hash: ${blockchainTx.hash}`,
      );
      const newBalance = await prismaTx.balance.update({
        where: { id: balanceId },
        data: {
          amount: {
            decrement: amount,
          },
        },
      });
      this.logger.log(
        `Balance updated id: ${newBalance.id}, new amount: ${newBalance.amount}`,
      );
      const tx = await prismaTx.transaction.create({
        data: {
          amount,
          receiverAddress,
          status: 'PENDING',
          hash: blockchainTx.hash,
          chainId: wallet.blockchainId,
          balanceId,
        },
      });
      this.logger.log(`Transaction created with id: ${tx.id}`);
      return blockchainTx;
    });
    return prismaTx;
  }
}
