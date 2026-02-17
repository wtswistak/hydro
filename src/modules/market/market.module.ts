import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { CoingeckoModule } from 'src/integrations/coingecko/coingecko.module';

@Module({
  imports: [CoingeckoModule],
  controllers: [MarketController],
})
export class MarketModule {}
