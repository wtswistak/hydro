import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/core/exception/base-exception';

export class CryptoTokenNotExistException extends BaseException {
  constructor() {
    super(
      'Crypto token does not exist',
      'CRYPTO_TOKEN_NOT_EXIST',
      HttpStatus.NOT_FOUND,
    );
  }
}
