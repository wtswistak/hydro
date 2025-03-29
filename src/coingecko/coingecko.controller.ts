import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';
import { AuthGuard } from '@nestjs/passport';
import { MarketChartDto } from './dto/market-chart.dto';
import { MarketChart } from './interface/market-chart-response';
import { Cryptocurrency } from './interface/cryptocurrency.interface';
import { BigIntInterceptor } from 'src/common/big-int.interceptor';

@Controller('coingecko')
export class CoingeckoController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @UseInterceptors(BigIntInterceptor)
  @Get('cryptocurrencies')
  @UseGuards(AuthGuard('jwt'))
  getCryptocurrenciesList(): Promise<Cryptocurrency[]> {
    return this.coingeckoService.getCryptocurrencies();
  }

  @UseInterceptors(BigIntInterceptor)
  @Get('market-chart/:id/:days')
  @UseGuards(AuthGuard('jwt'))
  getMarketChart(@Param() params: MarketChartDto): Promise<MarketChart> {
    return this.coingeckoService.getMarketChart(params);
  }
  @UseInterceptors(BigIntInterceptor)
  @Get('cryptocurrency/rate/:id')
  @UseGuards(AuthGuard('jwt'))
  getCryptocurrencyRate(@Param('id') id: string): Promise<number> {
    return this.coingeckoService.getCryptocurrencyRate({ id });
  }
}
