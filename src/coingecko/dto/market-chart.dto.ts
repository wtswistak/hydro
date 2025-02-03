import { Transform } from 'class-transformer';
import { IsNumber, IsString, Min } from 'class-validator';

export class MarketChartDto {
  @IsString()
  id: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  days: number;
}
