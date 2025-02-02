import { Transform } from 'class-transformer';

export class CryptocurrencyDto {
  id: string;
  symbol: string;
  name: string;
  image: string;

  @Transform(({ value }) => value)
  currentPrice: number;

  @Transform(({ value }) => value)
  marketCap: number;

  @Transform(({ value }) => value)
  marketCapRank: number;

  @Transform(({ value }) => value)
  fullyDilutedValuation: number;

  @Transform(({ value }) => value)
  totalVolume: number;

  @Transform(({ value }) => value)
  high24h: number;

  @Transform(({ value }) => value)
  low24h: number;

  @Transform(({ value }) => value)
  priceChange24h: number;

  @Transform(({ value }) => value)
  priceChangePercentage24h: number;

  @Transform(({ value }) => value)
  marketCapChange24h: number;

  @Transform(({ value }) => value)
  marketCapChangePercentage24h: number;

  @Transform(({ value }) => value)
  circulatingSupply: number;

  @Transform(({ value }) => value)
  totalSupply: number;

  @Transform(({ value }) => value)
  maxSupply: number;

  @Transform(({ value }) => value)
  ath: number;

  @Transform(({ value }) => value)
  athChangePercentage: number;

  @Transform(({ value }) => value)
  athDate: string;

  @Transform(({ value }) => value)
  atl: number;

  @Transform(({ value }) => value)
  atlChangePercentage: number;

  @Transform(({ value }) => value)
  atlDate: string;

  @Transform(({ value }) => value)
  roi: number;

  @Transform(({ value }) => value)
  lastUpdated: string;
}
