import { Injectable } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { AppConfigService } from 'src/config/app-config.service';
import { SendTransactionDto } from './dto/send-transaction.dto';

@Injectable()
export class BlockchainService {
  private readonly provider = new JsonRpcProvider();
  private readonly wallet: ethers.Wallet;

  constructor(private readonly configService: AppConfigService) {
    this.provider = new JsonRpcProvider(configService.ethNodeUrl);
    this.wallet = new ethers.Wallet(configService.privateKey, this.provider);
  }

  async sendTransaction({ to, amount }: SendTransactionDto) {
    try {
      const trx = await this.wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount.toString()),
        gasLimit: ethers.hexlify('0x5208'),
        gasPrice: (await this.provider.getFeeData()).gasPrice,
      });
      const transaction = await this.wallet.sendTransaction(trx);

      return transaction;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }
}
