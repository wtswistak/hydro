import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class BalanceNotExistException extends BaseException {
  constructor() {
    super('Balance does not exist', 'BALANCE_NOT_EXIST', HttpStatus.NOT_FOUND);
  }
}
