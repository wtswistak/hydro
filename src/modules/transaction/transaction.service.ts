import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, Transaction, TransactionStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import { BalanceService } from 'src/modules/balance/balance.service';
import { BlockchainService } from 'src/integrations/blockchain/blockchain.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { PrismaClient } from 'src/core/database/prisma/prisma.type';
import { CryptoService } from 'src/modules/wallet/crypto.service';
import { CreateTxDto } from 'src/modules/wallet/dto/create-tx.dto';
import { BalanceAmountTooLowException } from 'src/modules/wallet/exception/balance-amount-too-low.exception';
import { WalletNotMatchException } from 'src/modules/wallet/exception/wallet-not-match.exception';
import { InvalidAddressException } from './exception/invalid-address.exception';
import { Decimal } from 'decimal.js';
import { WalletService } from 'src/modules/wallet/wallet.service';
import { CreateEvmDetailsData, UpdateEvmDetailsData } from './types/evm-details.types';
import { BitcoinService } from 'src/integrations/bitcoin/bitcoin.service';
import { BlockchainType } from '@prisma/client';
import { CreateTransactionData } from './types/transaction.types';
import { BtcTxDetailsRepository } from './repository/btc-tx-details.repository';
import { CreateBtcDetailsData } from './types/btc-details.types';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly blockchainService: BlockchainService,
    private readonly bitcoinService: BitcoinService,
    private readonly cryptoService: CryptoService,
    private readonly balanceService: BalanceService,
    private readonly btcTxDetailsRepository: BtcTxDetailsRepository,
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
        include: { blockchain: true },
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
      if (new Decimal(balance.amount.toString()).lt(new Decimal(amount))) {
        throw new BalanceAmountTooLowException();
      }
      const newSenderBalance = await this.balanceService.updateBalance({
        balanceId: balance.id,
        amount: new Decimal(amount).negated().toString(),
      },
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
            amount,
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

      let txHash: string;
      let evmTxData: any = null;
      let btcTxData: any = null;

      // Handle based on Blockchain Type
      if (cryptoToken.blockchain.type === BlockchainType.BITCOIN) {
        if (!this.bitcoinService.isValidAddress(receiverAddress)) {
          throw new InvalidAddressException('Bitcoin');
        }
        const amountSatoshis = Math.round(parseFloat(amount) * 100_000_000);
        const btcResult = await this.bitcoinService.sendTransaction(
          decryptedPrivateKey,
          receiverAddress,
          amountSatoshis
        );
        txHash = btcResult.txid;
        btcTxData = {
          feeSatoshis: BigInt(btcResult.fee),
        };
      }
      if (cryptoToken.blockchain.type === BlockchainType.EVM) {
        const blockchainTx = await this.blockchainService.sendTransaction({
          receiverAddress,
          amount,
          privateKey: decryptedPrivateKey,
          contractAddress: cryptoToken.contractAddress,
          decimals: cryptoToken.decimals,
        });
        txHash = blockchainTx.hash;
        evmTxData = {
          nonce: blockchainTx.nonce,
          gasLimit: blockchainTx.gasLimit,
        };
      }

      const tx = await this.createTx(
        {
          amount,
          status: TransactionStatus.PENDING,
          receiverAddress,
          senderAddress: wallet.address,
          hash: txHash,
          blockchainId: cryptoToken.blockchainId,
          senderBalanceId: balance.id,
          receiverBalanceId: receiverBalanceId,
        },
        prismaTx,
      );
      this.logger.log(`Transaction created with id: ${tx.id}`);

      if (evmTxData) {
        await this.createEvmDetails(
          {
            transactionId: tx.id,
            ...evmTxData
          },
          prismaTx,
        );
        this.logger.log(`EvmTxDetails created for transaction id: ${tx.id}`);
      }
      if (btcTxData) {
        await this.btcTxDetailsRepository.createBtcTxDetails(
          {
            transactionId: tx.id,
            feeSatoshis: btcTxData.feeSatoshis,
          },
          prismaTx,
        );
        this.logger.log(`BtcTxDetails created for transaction id: ${tx.id}`);
      }

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
    data: Partial<Pick<Transaction, 'status' | 'blockRef' | 'cryptoFee' | 'fiatFee'>>;
  }) {
    return this.prisma.transaction.update({
      where: { id: txId },
      data,
    });
  }

  async updateTxWithEvmDetails({
    txId,
    txData,
    evmData,
  }: {
    txId: number;
    txData: Partial<Pick<Transaction, 'status' | 'blockRef' | 'cryptoFee' | 'fiatFee'>>;
    evmData: UpdateEvmDetailsData;
  }) {
    return this.prisma.$transaction(async (prisma) => {
      const tx = await prisma.transaction.update({
        where: { id: txId },
        data: txData,
      });

      const evmDetails = await prisma.evmTxDetails.update({
        where: { transactionId: txId },
        data: evmData,
      });

      return { tx, evmDetails };
    });
  }

  async updateTxWithBtcDetails({
    txId,
    txData,
    btcData,
  }: {
    txId: number;
    txData: Partial<Pick<Transaction, 'status' | 'blockRef' | 'cryptoFee' | 'fiatFee'>>;
    btcData: Partial<CreateBtcDetailsData>;
  }) {
    return this.prisma.$transaction(async (prisma) => {
      const tx = await prisma.transaction.update({
        where: { id: txId },
        data: txData,
      });

      const btcDetails = await prisma.btcTxDetails.update({
        where: { transactionId: txId },
        data: btcData,
      });

      return { tx, btcDetails };
    });
  }

  createTx(data: CreateTransactionData, prisma: PrismaClient = this.prisma) {
    return prisma.transaction.create({
      data: {
        amount: data.amount,
        status: data.status,
        receiverAddress: data.receiverAddress,
        senderAddress: data.senderAddress,
        hash: data.hash,
        blockchainId: data.blockchainId,
        senderBalanceId: data.senderBalanceId,
        receiverBalanceId: data.receiverBalanceId,
      },
    });
  }

  createEvmDetails(
    data: CreateEvmDetailsData,
    prisma: PrismaClient = this.prisma,
  ) {
    return prisma.evmTxDetails.create({
      data: {
        transactionId: data.transactionId,
        nonce: data.nonce,
        gasLimit: data.gasLimit,
        gasPrice: data.gasPrice,
        effectiveGasPrice: data.effectiveGasPrice,
        gasUsed: data.gasUsed,
      },
    });
  }

  getTxByHash({ hash }: { hash: string }) {
    return this.prisma.transaction.findUnique({
      where: { hash },
      include: { evmDetails: true, btcDetails: true, blockchain: true },
    });
  }
}
