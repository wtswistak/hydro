import {
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  IsString,
} from 'class-validator';

export class GetEstimatedFeeDto {
  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsNumberString()
  // @IsPositive()
  amount: string;

  @IsString()
  @IsNotEmpty()
  cryptoSymbol: string;
}
