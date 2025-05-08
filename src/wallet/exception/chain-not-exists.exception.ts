import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class ChainNotExistsException extends BaseException {
  constructor() {
    super('Chain not exists', 'CHAIN_NOT_EXISTS', HttpStatus.BAD_REQUEST);
  }
}
