import { IsNotEmpty, IsNumber, IsNumberString, IsPositive, IsString } from 'class-validator';

export class CreateTxDto {
  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsString()
  @IsNotEmpty()
  cryptoSymbol: string;

  @IsNumber()
  @IsPositive()
  senderWalletId: number;
}
