import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/exception/base-exception';

export class UserNotExistsException extends BaseException {
  constructor() {
    super('User does not exist', 'USER_NOT_EXISTS', HttpStatus.BAD_REQUEST);
  }
}
