import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';

@Controller('coingecko')
export class CoingeckoController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @Get('cryptocurrencies')
  getCryptocurrenciesList() {
    return this.coingeckoService.getCryptocurrenciesList();
  }
}
