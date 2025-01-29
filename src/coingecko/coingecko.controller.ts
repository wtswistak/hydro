import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { CoingeckoService } from './coingecko.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('coingecko')
export class CoingeckoController {
  constructor(private readonly coingeckoService: CoingeckoService) {}

  @Get('cryptocurrencies')
  @UseGuards(AuthGuard('jwt'))
  getCryptocurrenciesList() {
    return this.coingeckoService.getCryptocurrencies();
  }
}
