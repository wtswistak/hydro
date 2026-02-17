import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoingeckoService } from 'src/integrations/coingecko/coingecko.service';
import { MarketChartDto } from 'src/integrations/coingecko/dto/market-chart.dto';
import { Cryptocurrency } from 'src/integrations/coingecko/interface/cryptocurrency.interface';
import { MarketChart } from 'src/integrations/coingecko/interface/market-chart-response';
import { BigIntInterceptor } from 'src/core/interceptor/big-int.interceptor';

@Controller('market')
export class MarketController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @UseInterceptors(BigIntInterceptor)
  @Get('cryptocurrencies')
  @UseGuards(AuthGuard('jwt'))
  getCryptocurrenciesList(): Promise<Cryptocurrency[]> {
    return this.coingeckoService.getCryptocurrencies();
  }

  @UseInterceptors(BigIntInterceptor)
  @Get('chart/:id/:days')
  @UseGuards(AuthGuard('jwt'))
  getMarketChart(@Param() params: MarketChartDto): Promise<MarketChart> {
    return this.coingeckoService.getMarketChart(params);
  }

  @UseInterceptors(BigIntInterceptor)
  @Get('rate/:id')
  @UseGuards(AuthGuard('jwt'))
  async getCryptocurrencyRate(@Param('id') id: string): Promise<{ rate: string }> {
    const rate = await this.coingeckoService.getCryptocurrencyRate({
      id: id.toLowerCase(),
    });
    return { rate };
  }
}
