import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateTxDto {
  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsNumber()
  @IsPositive()
  amount: Decimal;

  @IsString()
  @IsNotEmpty()
  cryptoSymbol: string;

  @IsNumber()
  @IsPositive()
  senderWalletId: number;
}
