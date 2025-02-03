import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';
import { AuthGuard } from '@nestjs/passport';
import { MarketChartDto } from './dto/market-chart.dto';
import { MarketChart } from './interface/market-chart-response';
import { Cryptocurrency } from './interface/cryptocurrency.interface';

@Controller('coingecko')
export class CoingeckoController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @Get('cryptocurrencies')
  @UseGuards(AuthGuard('jwt'))
  getCryptocurrenciesList(): Promise<Cryptocurrency[]> {
    return this.coingeckoService.getCryptocurrencies();
  }

  @Get('market-chart/:id/:days')
  @UseGuards(AuthGuard('jwt'))
  getMarketChart(@Param() params: MarketChartDto): Promise<MarketChart> {
    return this.coingeckoService.getMarketChart(params);
  }
}
