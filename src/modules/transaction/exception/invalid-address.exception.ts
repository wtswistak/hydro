import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class InvalidAddressException extends BaseException {
  constructor(blockchainType: string) {
    super(
      `Invalid ${blockchainType} address`,
      'INVALID_ADDRESS',
      HttpStatus.BAD_REQUEST,
    );
  }
}
