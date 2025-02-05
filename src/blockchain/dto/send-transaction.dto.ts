import { IsNumber, IsString } from 'class-validator';

export class SendTransactionDto {
  @IsString()
  to: string;

  @IsNumber()
  amount: number;
}
