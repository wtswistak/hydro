import { IsNumber, IsString } from 'class-validator';

class Activity {
  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;

  @IsString()
  blockNum: string;

  @IsString()
  hash: string;

  @IsNumber()
  value: number;

  @IsString()
  asset: string;

  @IsString()
  category: string;

  rawContract?: {
    rawValue: string;
    decimals: number;
  };
}
export class AlchemyAddressActivityDto {
  @IsString()
  webhookId: string;

  @IsString()
  id: string;

  @IsString()
  createdAt: string;

  @IsString()
  type: string;
  event: {
    network: string;
    activity: Array<Activity>;
    source?: string;
  };
}
