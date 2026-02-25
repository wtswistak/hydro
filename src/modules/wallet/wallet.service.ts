import { Injectable, Logger } from '@nestjs/common';
import {
  BlockchainService
} from 'src/integrations/blockchain/blockchain.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';
import { CryptoService } from './crypto.service';
import { Transaction, Wallet, BlockchainType, TransactionStatus } from '@prisma/client';
import { WalletExistsException } from './exception/wallet-exist.exception';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ChainNotExistsException } from './exception/chain-not-exists.exception';
import { WalletNotExistsException } from './exception/wallet-not-exist.exception';
import { WalletNotMatchException } from './exception/wallet-not-match.exception';
import { WalletHasFundsException } from './exception/wallet-has-funds.exception';
import { SystemWalletNotFoundException } from './exception/system-wallet-not-found.exception';
import { WalletRepository } from './wallet.repository';
import { PrismaClient } from 'src/core/database/prisma/prisma.type';
import { EvmService } from 'src/integrations/evm/evm.service';
import { BitcoinService } from 'src/integrations/bitcoin/bitcoin.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Decimal } from 'decimal.js';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private prisma: PrismaService,
    private blockchainService: BlockchainService,
    private cryptoService: CryptoService,
    private walletRepository: WalletRepository,
    private evmService: EvmService,
    private bitcoinService: BitcoinService,
    @InjectQueue('transaction')
    private readonly transactionQueue: Queue,
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

  private static readonly FAUCET_EVM_AMOUNT = '0.0001';
  private static readonly FAUCET_BTC_SATOSHIS = 10_000;

  async topUpWallet({
    walletId,
    userId,
  }: {
    walletId: number;
    userId: number;
  }): Promise<Transaction> {
    this.logger.log(
      `Top-up requested for walletId: ${walletId}, userId: ${userId}`,
    );

    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      include: { balances: true, blockchain: true },
    });

    if (!wallet) {
      throw new WalletNotExistsException();
    }

    if (wallet.userId !== userId) {
      throw new WalletNotMatchException();
    }

    const hasAnyFunds = wallet.balances.some((b) =>
      new Decimal(b.amount.toString()).gt(0),
    );
    if (hasAnyFunds) {
      throw new WalletHasFundsException();
    }

    const systemWallet = await this.walletRepository.getSystemWalletByBlockchainId({
      blockchainId: wallet.blockchainId,
    });
    if (!systemWallet) {
      throw new SystemWalletNotFoundException();
    }

    const decryptedPrivateKey = this.cryptoService.decrypt({
      encryptedKey: systemWallet.privateKey,
    });

    let txHash: string;
    let evmTxData: { nonce: number; gasLimit: bigint } | null = null;
    let btcFeeSatoshis: bigint | null = null;

    if (wallet.blockchain.type === BlockchainType.EVM) {
      const amount = WalletService.FAUCET_EVM_AMOUNT;
      const blockchainTx = await this.evmService.sendTransaction({
        receiverAddress: wallet.address,
        amount,
        privateKey: decryptedPrivateKey,
        contractAddress: null,
        decimals: 18,
      });
      txHash = blockchainTx.hash;
      evmTxData = { nonce: blockchainTx.nonce, gasLimit: blockchainTx.gasLimit };
    } else if (wallet.blockchain.type === BlockchainType.BITCOIN) {
      const amountSatoshis = WalletService.FAUCET_BTC_SATOSHIS;
      const btcResult = await this.bitcoinService.sendTransaction(
        decryptedPrivateKey,
        wallet.address,
        amountSatoshis,
      );
      txHash = btcResult.txid;
      btcFeeSatoshis = BigInt(btcResult.fee);
    }

    const tx = await this.prisma.$transaction(async (prismaTx) => {
      const created = await prismaTx.transaction.create({
        data: {
          amount:
            wallet.blockchain.type === BlockchainType.EVM
              ? WalletService.FAUCET_EVM_AMOUNT
              : (WalletService.FAUCET_BTC_SATOSHIS / 100_000_000).toFixed(8),
          status: TransactionStatus.PENDING,
          senderAddress: systemWallet.address,
          receiverAddress: wallet.address,
          hash: txHash,
          blockchainId: wallet.blockchainId,
          senderBalanceId: null,
          receiverBalanceId: null,
        },
      });

      if (evmTxData) {
        await prismaTx.evmTxDetails.create({
          data: {
            transactionId: created.id,
            nonce: evmTxData.nonce,
            gasLimit: evmTxData.gasLimit,
          },
        });
      }

      if (btcFeeSatoshis !== null) {
        await prismaTx.btcTxDetails.create({
          data: {
            transactionId: created.id,
            feeSatoshis: btcFeeSatoshis,
          },
        });
      }

      return created;
    });

    this.logger.log(
      `Top-up transaction created id: ${tx.id}, hash: ${tx.hash}`,
    );

    await this.transactionQueue.add(
      'transaction',
      { txId: tx.id, txHash: tx.hash },
      {
        attempts: 10,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );

    return tx;
  }
}
