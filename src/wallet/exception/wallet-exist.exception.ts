import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class WalletExistsException extends BaseException {
  constructor() {
    super('Wallet already exists', 'WALLET_EXISTS', HttpStatus.BAD_REQUEST);
  }
}
