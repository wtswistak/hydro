import { Injectable, Logger } from '@nestjs/common';
import { BlockchainType, TransactionStatus } from '@prisma/client';
import Decimal from 'decimal.js';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { PrismaClient } from 'src/core/database/prisma/prisma.type';
import { BitcoinService } from 'src/integrations/bitcoin/bitcoin.service';
import { MempoolTransaction } from 'src/integrations/bitcoin/types/mempool-api.interface';

@Injectable()
export class BitcoinDepositScannerService {
  private readonly logger = new Logger(BitcoinDepositScannerService.name);
  private static readonly SATOSHIS_PER_BTC = 100_000_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly bitcoinService: BitcoinService,
  ) {}

  async scanAllWallets(): Promise<void> {
    const wallets = await this.prisma.wallet.findMany({
      where: {
        deletedAt: null,
        blockchain: {
          type: BlockchainType.BITCOIN,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        address: true,
        blockchainId: true,
      },
    });

    this.logger.log(`Scanning ${wallets.length} Bitcoin wallets for deposits`);

    for (const wallet of wallets) {
      try {
        const transactions = await this.bitcoinService.getAddressTransactions(
          wallet.address,
        );

        for (const tx of transactions) {
          await this.processWalletTransaction({
            wallet,
            tx,
          });
        }

        this.logger.debug(
          `Scanned Bitcoin wallet id: ${wallet.id}, transactions: ${transactions.length}`,
        );
      } catch (error) {
        this.logger.error(
          `Bitcoin deposit scan failed for wallet id: ${wallet.id}`,
          error,
        );
      }
    }
  }

  private async processWalletTransaction({
    wallet,
    tx,
  }: {
    wallet: { id: number; address: string; blockchainId: number };
    tx: MempoolTransaction;
  }): Promise<void> {
    for (const [vout, output] of tx.vout.entries()) {
      if (output.scriptpubkey_address !== wallet.address) {
        continue;
      }

      await this.processDepositOutput({
        wallet,
        tx,
        vout,
        valueSatoshis: output.value,
      });
    }
  }

  private async processDepositOutput({
    wallet,
    tx,
    vout,
    valueSatoshis,
  }: {
    wallet: { id: number; address: string; blockchainId: number };
    tx: MempoolTransaction;
    vout: number;
    valueSatoshis: number;
  }): Promise<void> {
    const depositHash = this.getDepositHash(tx.txid, vout);

    await this.prisma.$transaction(async (prismaTx) => {
      const existingDetails = await prismaTx.btcTxDetails.findFirst({
        where: {
          txid: tx.txid,
          vout,
        },
        include: {
          transaction: true,
        },
      });

      if (existingDetails) {
        await this.updateExistingDeposit({
          prismaTx,
          existingDetails,
          tx,
        });
        return;
      }

      await this.createDeposit({
        prismaTx,
        wallet,
        tx,
        depositHash,
        vout,
        valueSatoshis,
      });
    });
  }

  private async createDeposit({
    prismaTx,
    wallet,
    tx,
    depositHash,
    vout,
    valueSatoshis,
  }: {
    prismaTx: PrismaClient;
    wallet: { id: number; address: string; blockchainId: number };
    tx: MempoolTransaction;
    depositHash: string;
    vout: number;
    valueSatoshis: number;
  }): Promise<void> {
    const btcToken = await prismaTx.cryptoToken.findUnique({
      where: { symbol: 'BTC' },
    });

    if (!btcToken) {
      this.logger.error('BTC token not found, skipping Bitcoin deposit scan');
      return;
    }

    const amount = this.satoshisToBtc(valueSatoshis);
    const status = tx.status.confirmed
      ? TransactionStatus.SUCCESS
      : TransactionStatus.PENDING;

    const receiverBalance = await prismaTx.balance.upsert({
      where: {
        walletId_cryptoTokenId: {
          walletId: wallet.id,
          cryptoTokenId: btcToken.id,
        },
      },
      update: tx.status.confirmed
        ? {
            amount: {
              increment: amount,
            },
          }
        : {},
      create: {
        walletId: wallet.id,
        cryptoTokenId: btcToken.id,
        amount: tx.status.confirmed ? amount : '0',
      },
    });

    const transaction = await prismaTx.transaction.create({
      data: {
        amount,
        status,
        senderAddress: this.getSenderAddress(tx),
        receiverAddress: wallet.address,
        hash: depositHash,
        blockchainId: wallet.blockchainId,
        senderBalanceId: null,
        receiverBalanceId: receiverBalance.id,
        blockRef: tx.status.block_height
          ? BigInt(tx.status.block_height)
          : null,
      },
    });

    await prismaTx.btcTxDetails.create({
      data: {
        transactionId: transaction.id,
        txid: tx.txid,
        vout,
        vsize: tx.size,
        weight: tx.weight,
        feeSatoshis: BigInt(tx.fee),
        confirmations: tx.status.confirmed ? 1 : 0,
        inputs: tx.vin,
        outputs: tx.vout,
      },
    });

    this.logger.log(
      `Bitcoin deposit created: txId=${transaction.id}, walletId=${wallet.id}, amount=${amount}, status=${status}`,
    );
  }

  private async updateExistingDeposit({
    prismaTx,
    existingDetails,
    tx,
  }: {
    prismaTx: PrismaClient;
    existingDetails: any;
    tx: MempoolTransaction;
  }): Promise<void> {
    const isConfirmed = tx.status.confirmed;
    const isPending =
      existingDetails.transaction.status === TransactionStatus.PENDING;

    if (!isPending) {
      return;
    }

    if (!isConfirmed) {
      this.logger.debug(
        `Bitcoin deposit still pending: txId=${existingDetails.transactionId}, txid=${tx.txid}`,
      );
      return;
    }

    await prismaTx.btcTxDetails.update({
      where: { transactionId: existingDetails.transactionId },
      data: {
        vsize: tx.size,
        weight: tx.weight,
        feeSatoshis: BigInt(tx.fee),
        confirmations: isConfirmed ? 1 : 0,
        inputs: tx.vin,
        outputs: tx.vout,
      },
    });

    await prismaTx.transaction.update({
      where: { id: existingDetails.transactionId },
      data: {
        status: TransactionStatus.SUCCESS,
        blockRef: tx.status.block_height
          ? BigInt(tx.status.block_height)
          : null,
      },
    });

    if (existingDetails.transaction.receiverBalanceId) {
      await prismaTx.balance.update({
        where: { id: existingDetails.transaction.receiverBalanceId },
        data: {
          amount: {
            increment: existingDetails.transaction.amount,
          },
        },
      });
    }

    this.logger.log(
      `Bitcoin deposit confirmed: txId=${existingDetails.transactionId}, txid=${tx.txid}, amount=${existingDetails.transaction.amount}`,
    );
  }

  private satoshisToBtc(valueSatoshis: number): string {
    return new Decimal(valueSatoshis)
      .div(BitcoinDepositScannerService.SATOSHIS_PER_BTC)
      .toFixed(8);
  }

  private getSenderAddress(tx: MempoolTransaction): string {
    return (
      tx.vin.find((input) => input.prevout?.scriptpubkey_address)?.prevout
        ?.scriptpubkey_address ?? 'external'
    );
  }

  private getDepositHash(txid: string, vout: number): string {
    return `${txid}:${vout}`;
  }
}
