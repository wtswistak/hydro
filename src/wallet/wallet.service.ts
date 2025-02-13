import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { Wallet } from '@prisma/client';
import { WalletExistsException } from './exception/wallet-exist.exception';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private cryptoService: CryptoService,
  ) {}

  async createWallet({ userId }: { userId: number }): Promise<Wallet> {
    this.logger.log(`Checking if wallet exists for user with id: ${userId}`);
    const existingWallet = await this.getWalletByUserId({ userId });
    if (existingWallet) {
      throw new WalletExistsException();
    }

    this.logger.log(`Creating wallet for user with id: ${userId}`);
    const blockchainWallet = this.blockchainService.createWallet();
    const encryptedPrivateKey = this.cryptoService.encrypt({
      privateKey: blockchainWallet.privateKey,
    });
    const wallet = await this.prisma.wallet.create({
      data: {
        userId,
        address: blockchainWallet.address,
        privateKey: encryptedPrivateKey,
      },
    });
    this.logger.log(`Created wallet for user with id: ${userId}`);

    return wallet;
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
}
