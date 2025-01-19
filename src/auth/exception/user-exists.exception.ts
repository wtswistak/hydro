import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/exception/base-exception';

export class UserExistsException extends BaseException {
  constructor() {
    super('User already exist', 'USER_EXISTS', HttpStatus.BAD_REQUEST);
  }
}
