import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/core/exception/base-exception';

export class SystemWalletNotFoundException extends BaseException {
  constructor() {
    super(
      'System wallet not found for this blockchain.',
      'SYSTEM_WALLET_NOT_FOUND',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
