import { IsNumber, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  blockchain: string;
}
