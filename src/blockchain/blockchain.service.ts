import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { AppConfigService } from 'src/config/app-config.service';
import { SendTransactionDto } from './dto/send-transaction.dto';

@Injectable()
export class BlockchainService {
  private readonly provider = new JsonRpcProvider();
  private readonly privateWallet: ethers.Wallet;
  private readonly logger = new Logger(BlockchainService.name);

  constructor(private readonly configService: AppConfigService) {
    this.provider = new JsonRpcProvider(configService.ethNodeUrl);
    this.privateWallet = new ethers.Wallet(
      configService.privateKey,
      this.provider,
    );
  }

  private handleError(error: any, message: string): void {
    if (error.message) {
      this.logger.error(error.message);
    }

    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  createWallet() {
    return ethers.Wallet.createRandom();
  }

  async sendTransactionByPrivateWallet({ to, amount }: SendTransactionDto) {
    try {
      const trx = {
        to,
        value: ethers.parseEther(amount.toString()),
        gasLimit: ethers.hexlify('0x5208'),
        gasPrice: (await this.provider.getFeeData()).gasPrice,
      };
      const transaction = await this.privateWallet.sendTransaction(trx);

      return transaction;
    } catch (error) {
      this.handleError(error, 'sendTransactionByPrivateWallet');
    }
  }

  getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async sendTransaction({ to, amount, privateKey }) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString()),
        gasLimit: 21000,
        gasPrice: (await this.provider.getFeeData()).gasPrice,
      });

      return tx;
    } catch (error) {
      this.handleError(error, 'sendTransaction');
    }
  }

  async getBalance({ address }: { address: string }): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);

      return ethers.formatEther(balance);
    } catch (error) {
      this.handleError(error, 'getBalance');
    }
  }
}
