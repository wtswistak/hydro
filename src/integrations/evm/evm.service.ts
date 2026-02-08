import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { ERC20_ABI } from './erc20.abi';
import { AppConfigService } from 'src/core/config/app-config.service';
import { EstimatedFee, EstimatedFeePayload, SendTransactionPayload } from './types/evm.types';
import { Decimal } from 'decimal.js';

@Injectable()
export class EvmService {
  private readonly provider: JsonRpcProvider;
  private readonly privateWallet: ethers.Wallet;
  private readonly logger = new Logger(EvmService.name);

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

  async getTransactionReceipt({ txHash }: { txHash: string }) {
    try {
      return await this.provider.getTransactionReceipt(txHash);
    } catch (error) {
      this.handleError(error, 'getTransactionReceipt');
    }
  }

  async sendTransaction({
    receiverAddress,
    amount,
    privateKey,
    contractAddress,
    decimals,
  }: SendTransactionPayload) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);

      let tx;
      if (contractAddress) {
        const contract = new ethers.Contract(
          contractAddress,
          ERC20_ABI,
          wallet,
        );
        const amountInUnits = ethers.parseUnits(amount, decimals);
        tx = await contract.transfer(receiverAddress, amountInUnits);
      } else {
        tx = await wallet.sendTransaction({
          to: receiverAddress,
          value: ethers.parseEther(amount),
        });
      }

      this.logger.log(`Transaction sent to blockchain with hash: ${tx.hash}`);
      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        to: tx.to,
        from: tx.from,
        value: tx.value ? ethers.formatEther(tx.value) : '0',
        gasLimit: tx.gasLimit,
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
  async sendTransactionByPrivateWallet({ to, amount }: { to: string; amount: string }) {
    try {
      const trx = {
        to,
        value: ethers.parseEther(amount),
        gasLimit: ethers.hexlify('0x5208'),
        gasPrice: (await this.provider.getFeeData()).gasPrice,
      };
      const transaction = await this.privateWallet.sendTransaction(trx);
      return transaction;
    } catch (error) {
      this.handleError(error, 'sendTransactionByPrivateWallet');
    }
  }

  async estimateFee({
    receiverAddress,
    amount,
    contractAddress,
    decimals,
    senderAddress,
  }: EstimatedFeePayload): Promise<EstimatedFee> {
    try {
      let estimatedGas: bigint;
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;

      if (contractAddress) {
        const contract = new ethers.Contract(
          contractAddress,
          ERC20_ABI,
          this.provider,
        );
        const amountInUnits = ethers.parseUnits(amount, decimals);
        try {
          const overrides = senderAddress ? { from: senderAddress } : {};
          estimatedGas = await contract.transfer.estimateGas(
            receiverAddress,
            amountInUnits,
            overrides,
          );
        } catch (error) {
          estimatedGas = BigInt(65000);
          this.logger.warn(
            `Failed to estimate gas for ERC20 transfer, using default: ${estimatedGas}`,
          );
        }
      } else {
        estimatedGas = await this.provider.estimateGas({
          to: receiverAddress,
          value: ethers.parseEther(amount.toString()),
          from: senderAddress,
        });
      }

      const feeInWei = estimatedGas * BigInt(gasPrice);
      const feeInEth = ethers.formatEther(feeInWei);

      return { feeInCrypto: feeInEth };
    } catch (error) {
      this.handleError(error, 'estimateFee');
    }
  }

  calculateFee({ gasPrice, gasUsed }: { gasPrice: bigint; gasUsed: bigint }) {
    const feeInWei = gasPrice * gasUsed;
    return new Decimal(ethers.formatEther(feeInWei));
  }

  async getFeeHistory(blockCount: number, percentiles: number[]) {
    try {
      const hexBlocks = ethers.hexlify(ethers.toBeHex(blockCount));
      return await this.provider.send('eth_feeHistory', [
        hexBlocks,
        'latest',
        percentiles,
      ]);
    } catch (error) {
      this.handleError(error, 'getFeeHistory');
    }
  }
}
