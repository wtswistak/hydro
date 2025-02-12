import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { Wallet } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private cryptoService: CryptoService,
  ) {}

  async createWallet({ userId }: { userId: number }): Promise<Wallet> {
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
}
