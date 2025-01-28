import { Controller, Get } from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';

@Controller('coingecko')
export class CoingeckoController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @Get('cryptocurrencies')
  async getCryptocurrenciesList() {
    return this.coingeckoService.getCryptocurrenciesList();
  }
}
