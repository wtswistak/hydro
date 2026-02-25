import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/core/exception/base-exception';

export class WalletHasFundsException extends BaseException {
  constructor() {
    super(
      'Wallet already has funds. Top-up is only available for wallets with zero balance.',
      'WALLET_HAS_FUNDS',
      HttpStatus.CONFLICT,
    );
  }
}
