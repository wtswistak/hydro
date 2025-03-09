import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/exception/base-exception';

export class WalletNotMatchException extends BaseException {
  constructor() {
    super(
      'Wallet not match to this user',
      'WALLET_NOT_MATCH',
      HttpStatus.BAD_REQUEST,
    );
  }
}
