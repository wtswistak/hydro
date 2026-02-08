import { Injectable, Logger } from '@nestjs/common';
import { BlockchainType } from '@prisma/client';
import { BitcoinService } from 'src/integrations/bitcoin/bitcoin.service';
import { EvmService } from 'src/integrations/evm/evm.service';
import { EstimatedFee, EstimatedFeePayload } from 'src/integrations/evm/types/evm.types';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    private readonly evmService: EvmService,
    private readonly bitcoinService: BitcoinService,
  ) {}

  createWallet(type: BlockchainType) {
    if (type === BlockchainType.BITCOIN) {
      return this.bitcoinService.createWallet();
    }
    if (type === BlockchainType.EVM) {
      return this.evmService.createWallet();
    }
  }

  async estimateFee(
    payload: EstimatedFeePayload & { type?: BlockchainType },
  ): Promise<EstimatedFee> {
    const { type, ...evmPayload } = payload;

    if (type === BlockchainType.BITCOIN) {
      const amountInSats = Math.round(parseFloat(payload.amount) * 100_000_000);
      const { fee } = await this.bitcoinService.getEstimatedTransactionFee(
        payload.senderAddress,
        amountInSats,
      );
      const feeInBtc = (fee / 100_000_000).toFixed(8);
      return { feeInCrypto: feeInBtc };
    }

    if (type === BlockchainType.EVM) {
      return this.evmService.estimateFee(evmPayload);
    }
  }
}
