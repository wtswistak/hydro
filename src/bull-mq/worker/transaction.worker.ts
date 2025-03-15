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
  // refactor method
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

        const attemptsMade = job.attemptsMade;
        if (attemptsMade < 5) {
          throw new Error('Transaction not confirmed yet');
        } else {
          await this.walletService.updateTxStatus({
            txId,
            status: TransactionStatus.FAIL,
          });
          this.logger.log(
            `Transaction ${txHash} marked as FAILED after ${attemptsMade} attempts`,
          );
          return { success: false, status: TransactionStatus.FAIL };
        }
      }

      let status: TransactionStatus;

      if (receipt.status === 1) {
        status = TransactionStatus.SUCCESS;
      } else {
        status = TransactionStatus.FAIL;
      }

      await this.walletService.updateTxStatus({
        txId,
        status,
      });

      this.logger.log(`Transaction ${txHash} updated with status: ${status}`);

      return { success: true, status };
    } catch (error) {
      this.logger.error(`Error processing transaction check: ${error.message}`);
      throw error;
    }
  }
}
