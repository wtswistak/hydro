import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class InvalidPasswordException extends BaseException {
  constructor() {
    super('Invalid password', 'INVALID_PASSWORD', HttpStatus.BAD_REQUEST);
  }
}
