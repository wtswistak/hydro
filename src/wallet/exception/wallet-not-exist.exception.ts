import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class WalletNotExistsException extends BaseException {
  constructor() {
    super('Wallet not exists', 'WALLET_NOT_EXISTS', HttpStatus.BAD_REQUEST);
  }
}
