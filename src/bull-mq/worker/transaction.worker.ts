import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CoingeckoService } from 'src/coingecko/coingecko.service';
import { TransactionService } from 'src/transaction/transaction.service';

@Processor('transaction')
export class TransactionWorker extends WorkerHost {
  private readonly logger = new Logger(TransactionWorker.name);
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly coingeckoService: CoingeckoService,
    private readonly transactionService: TransactionService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    try {
      const { txHash, txId } = job.data;
      this.logger.log(
        `Processing transaction check for txHash: ${txHash}, txId: ${txId}`,
      );
      const receipt = await this.blockchainService.getTransactionReceipt({
        txHash,
      });

      if (!receipt) {
        this.logger.log(
          `No receipt found for transaction ${txHash}, retrying...`,
        );
        throw new Error('Transaction not confirmed yet');
      }

      let status = null;
      if (receipt && receipt.status === 1) {
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
      const fiatFee = ethFee * rate;

      await this.transactionService.updateTxDetails({
        txId,
        data: {
          status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          gasPrice: receipt.gasPrice,
          cryptoFee: new Prisma.Decimal(ethFee),
          fiatFee: new Prisma.Decimal(fiatFee),
        },
      });

      return {
        success: status === TransactionStatus.SUCCESS,
        status,
      };
    } catch (error) {
      this.logger.error(`Error processing transaction check:`, {
        message: error.message,
        stack: error.stack,
        job: job.data,
      });
      throw error;
    }
  }
}
