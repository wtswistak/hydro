import { Injectable } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { AppConfigService } from 'src/config/app-config.service';
import { SendTransactionDto } from './dto/send-transaction.dto';

@Injectable()
export class BlockchainService {
  private readonly provider = new JsonRpcProvider();
  private readonly privateWallet: ethers.Wallet;

  constructor(private readonly configService: AppConfigService) {
    this.provider = new JsonRpcProvider(configService.ethNodeUrl);
    this.privateWallet = new ethers.Wallet(
      configService.privateKey,
      this.provider,
    );
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
      console.error(error);
      return null;
    }
  }
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async createWallet() {
    return ethers.Wallet.createRandom();
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
      console.error(error);
      return null;
    }
  }
}
