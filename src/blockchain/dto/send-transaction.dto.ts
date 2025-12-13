import { IsNumberString, IsString } from 'class-validator';

export class SendTransactionDto {
  @IsString()
  to: string;

  @IsString()
  @IsNumberString()
  amount: string;
}
