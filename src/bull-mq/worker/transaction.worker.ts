import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { WalletService } from 'src/wallet/wallet.service';

@Processor('transaction')
export class TransactionWorker extends WorkerHost {
  private readonly logger = new Logger(TransactionWorker.name);
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly walletService: WalletService,
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

      await this.walletService.updateTxDetails({
        txId,
        data: {
          status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          gasPrice: receipt.gasPrice,
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
