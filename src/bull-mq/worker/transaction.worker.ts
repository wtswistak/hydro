import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { BlockchainType, TransactionStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CoingeckoService } from 'src/coingecko/coingecko.service';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { BitcoinService } from 'src/bitcoin/bitcoin.service';
import { Decimal } from 'decimal.js';

@Processor('transaction')
export class TransactionWorker extends WorkerHost {
  private readonly logger = new Logger(TransactionWorker.name);
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly coingeckoService: CoingeckoService,
    private readonly transactionService: TransactionService,
    private readonly bitcoinService: BitcoinService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      const { txHash, txId } = job.data;
      this.logger.log(
        `Processing transaction check for txHash: ${txHash}, txId: ${txId}`,
      );

      const dbTx = await this.transactionService.getTxByHash({ hash: txHash });
      if (!dbTx) {
        throw new Error(`Transaction ${txHash} not found in database`);
      }

      if (dbTx.blockchain.type === BlockchainType.BITCOIN) {
        return this.processBitcoinTransaction(txHash, txId);
      }

      return this.processEvmTransaction(txHash, txId);
    } catch (error) {
      this.logger.error(`Error processing transaction check:`, {
        message: error.message,
        stack: error.stack,
        job: job.data,
      });
      throw error;
    }
  }

  private async processEvmTransaction(txHash: string, txId: number) {
    const receipt = await this.blockchainService.getTransactionReceipt({
      txHash,
    });

    if (!receipt) {
      this.logger.log(
        `No receipt found for transaction ${txHash}, retrying...`,
      );
      throw new Error('Transaction not confirmed yet');
    }

    let status: TransactionStatus;
    if (receipt.status === 1) {
      status = TransactionStatus.SUCCESS;
      this.logger.log(`Transaction ${txHash} updated with status: SUCCESS`);
    } else {
      status = TransactionStatus.FAIL;
      this.logger.log(
        `Transaction ${txHash} updated with status: FAIL, status from blockchain: ${receipt.status}`,
      );
    }

    const ethFee = this.blockchainService.calculateFee({
      gasUsed: receipt.gasUsed,
      gasPrice: receipt.gasPrice,
    });
    const rate = await this.coingeckoService.getCryptocurrencyRate({
      id: 'ethereum',
    });
    const fiatFee = ethFee.times(rate);

    await this.transactionService.updateTxWithEvmDetails({
      txId,
      txData: {
        status,
        blockRef: BigInt(receipt.blockNumber),
        cryptoFee: ethFee,
        fiatFee: fiatFee,
      },
      evmData: {
        gasUsed: receipt.gasUsed,
        gasPrice: receipt.gasPrice,
      },
    });

    this.logger.log(`Transaction ${txHash} and EvmTxDetails updated atomically`);

    return {
      success: status === TransactionStatus.SUCCESS,
      status,
    };
  }

  private async processBitcoinTransaction(txHash: string, txId: number) {
    const btcTx = await this.bitcoinService.getTransaction(txHash);

    if (!btcTx || !btcTx.status.confirmed) {
      this.logger.log(
        `Bitcoin transaction ${txHash} not confirmed yet, retrying...`,
      );
      throw new Error('Bitcoin transaction not confirmed yet');
    }

    const status = TransactionStatus.SUCCESS;
    this.logger.log(`Bitcoin transaction ${txHash} confirmed`);

    // Calculate fiat value of fee
    const feeSatoshis = btcTx.fee;
    const feeInBtc = new Decimal(feeSatoshis).div(100_000_000);
    
    const rate = await this.coingeckoService.getCryptocurrencyRate({
      id: 'bitcoin',
    });
    const fiatFee = feeInBtc.times(rate);

    await this.transactionService.updateTxWithBtcDetails({
      txId,
      txData: {
        status,
        blockRef: btcTx.status.block_height ? BigInt(btcTx.status.block_height) : null,
        cryptoFee: feeInBtc,
        fiatFee: fiatFee,
      },
      btcData: {
        confirmations: 1, // At least 1 confirmation if confirmed
        vsize: btcTx.size,
        weight: btcTx.weight,
      },
    });

    this.logger.log(`Bitcoin transaction ${txHash} and BtcTxDetails updated atomically`);

    return {
      success: true,
      status,
    };
  }
}
