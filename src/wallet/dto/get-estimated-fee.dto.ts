import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class GetEstimatedFeeDto {
  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsNumber()
  @IsPositive()
  amount: Decimal;
}
