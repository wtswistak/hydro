import { HttpStatus } from '@nestjs/common';
import { BaseException } from 'src/common/exception/base-exception';

export class EmailNotVerifiedException extends BaseException {
  constructor() {
    super('Email not verified', 'EMAIL_NOT_VERIFIED', HttpStatus.UNAUTHORIZED);
  }
}