import { IsNumber, IsString } from 'class-validator';

export class CreateTxDto {
  @IsString()
  receiverAddress: string;

  @IsNumber()
  amount: number;

  @IsString()
  cryptoSymbol: string;
}
