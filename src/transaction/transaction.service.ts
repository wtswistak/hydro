import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Transaction, TransactionStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { BalanceService } from 'src/balance/balance.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { PrismaClient } from 'src/database/prisma/prisma.type';
import { CryptoService } from 'src/wallet/crypto.service';
import { CreateTxDto } from 'src/wallet/dto/create-tx.dto';
import { BalanceAmountTooLowException } from 'src/wallet/exception/balance-amount-too-low.exception';
import { WalletNotMatchException } from 'src/wallet/exception/wallet-not-match.exception';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly blockchainService: BlockchainService,
    private readonly cryptoService: CryptoService,
    private readonly balanceService: BalanceService,
    @InjectQueue('transaction')
    private readonly transactionQueue: Queue,
  ) {}

  async createTransaction({
    userId,
    receiverAddress,
    cryptoSymbol,
    amount,
    senderWalletId,
  }: { userId: number } & CreateTxDto): Promise<Transaction> {
    this.logger.log(
      `Creating transaction for user id: ${userId}, receiverAddress: ${receiverAddress}, amount: ${amount}`,
    );
    const prismaTx = this.prisma.$transaction(async (prismaTx) => {
      const cryptoToken = await prismaTx.cryptoToken.findUnique({
        where: { symbol: cryptoSymbol },
      });
      const wallet = await this.walletService.getWalletById({
        id: senderWalletId,
      });
      if (wallet.userId !== userId) {
        throw new WalletNotMatchException();
      }
      const balance = await this.balanceService.getBalanceByWalletId(
        {
          walletId: wallet.id,
          cryptoTokenId: cryptoToken.id,
        },
        prismaTx,
      );
      if (balance.amount < amount) {
        throw new BalanceAmountTooLowException();
      }
      const newSenderBalance = await this.balanceService.updateBalance(
        { balanceId: balance.id, amount: -amount },
        prismaTx,
      );
      this.logger.log(
        `Balance updated id: ${newSenderBalance.id}, new amount: ${newSenderBalance.amount}`,
      );

      const receiverWallet = await this.walletService.getWalletByAddress({
        address: receiverAddress,
      });
      let receiverBalanceId = null;
      if (receiverWallet) {
        this.logger.log(`Receiver wallet found id: ${receiverWallet.id}`);
        // check if receiver balance exists and update
        const receiverBalance = await this.balanceService.upsertBalance(
          {
            walletId: receiverWallet.id,
            cryptoTokenId: cryptoToken.id,
            amount: new Prisma.Decimal(amount),
          },
          prismaTx,
        );
        receiverBalanceId = receiverBalance.id;
        this.logger.log(
          `Receiver balance updated, new amount: ${receiverBalance.amount}`,
        );
      }
      const decryptedPrivateKey = this.cryptoService.decrypt({
        encryptedKey: wallet.privateKey,
      });

      const blockchainTx = await this.blockchainService.sendTransaction({
        receiverAddress,
        amount,
        privateKey: decryptedPrivateKey,
      });

      const tx = await this.createTx(
        {
          amount,
          status: TransactionStatus.PENDING,
          receiverAddress,
          senderAddress: wallet.address,
          hash: blockchainTx.hash,
          senderBalanceId: balance.id,
          receiverBalanceId: receiverBalanceId,
          nonce: blockchainTx.nonce,
          gasLimit: blockchainTx.gasLimit,
        },
        prismaTx,
      );
      this.logger.log(`Transaction created with id: ${tx.id}`);

      await this.transactionQueue.add(
        'transaction',
        {
          txId: tx.id,
          txHash: tx.hash,
        },
        {
          attempts: 10,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
        },
      );

      return tx;
    });
    return prismaTx;
  }

  updateTxDetails({
    txId,
    data,
  }: {
    txId: number;
    data: Partial<Transaction>;
  }) {
    return this.prisma.transaction.update({
      where: { id: txId },
      data,
    });
  }

  createTx(data: Partial<Transaction>, prisma: PrismaClient = this.prisma) {
    return prisma.transaction.create({
      data: {
        amount: new Prisma.Decimal(data.amount),
        status: data.status,
        receiverAddress: data.receiverAddress,
        senderAddress: data.senderAddress,
        hash: data.hash,
        senderBalanceId: data.senderBalanceId,
        receiverBalanceId: data.receiverBalanceId,
        nonce: data.nonce,
        gasLimit: data.gasLimit,
      },
    });
  }
}
