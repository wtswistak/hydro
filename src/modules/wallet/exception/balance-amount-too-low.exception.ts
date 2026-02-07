import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class BalanceAmountTooLowException extends BaseException {
  constructor() {
    super(
      'Balance amount is too low',
      'BALANCE_AMOUNT_TOO_LOW',
      HttpStatus.BAD_REQUEST,
    );
  }
}
