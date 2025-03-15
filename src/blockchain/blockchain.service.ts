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

  getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * @returns
   *   provider: JsonRpcProvider {}: Dostawca (np. Alchemy, Infura) używany do interakcji z siecią.
   *   blockNumber: null, blockHash: null: Transakcja jeszcze nie została zatwierdzona, więc te pola są puste.
   *   hash: '0x7c7a83f0eb0cdecc66686a18e7717d9e28fa6372fb468dae67d4937a95881f76': Unikalny identyfikator transakcji.
   *   type: 2: Typ transakcji 2 oznacza, że jest to transakcja zgodna z EIP-1559 (typ 0 to starszy format z gasPrice).
   *   to: '0xCE78F1CE31844D63a839039Ab0D1915a312d4F58', from: '0x6dF4bE74Aeb8d48f740f3396A65175ce9dCD3a21': Adresy odbiorcy i nadawcy.
   *   nonce: 12: Numer sekwencji transakcji dla nadawcy.
   *   gasLimit: 21000n: Limit gazu (standardowa wartość dla prostej transakcji ETH).
   *   gasPrice: undefined: Nie używane w EIP-1559.
   *   maxPriorityFeePerGas: 1201394n: Napiwek dla górnika (w wei).
   *   maxFeePerGas: 155169075488n: Maksymalna całkowita opłata za jednostkę gazu (w wei).
   *   value: 200000000000000n: Wartość transakcji (0.0002 ETH w wei).
   *   chainId: 11155111n: Identyfikator łańcucha Sepolia.
   */
  async sendTransaction({ receiverAddress, amount, privateKey }) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const tx = await wallet.sendTransaction({
        to: receiverAddress,
        value: ethers.parseEther(amount.toString()),
      });
      console.log(tx);

      this.logger.log(`Transaction sent to blockchain with hash: ${tx.hash}`);
      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        to: tx.to,
        from: tx.from,
        value: ethers.formatEther(tx.value),
        gasLimit: tx.gasLimit.toString(),
        nonce: tx.nonce,
      };
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

  // only for test dev
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
}
