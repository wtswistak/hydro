import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  constructor(private readonly httpService: HttpService) {}

  async getCryptocurrenciesList() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          'coins/markets?vs_currency=usd&per_page=10&page=1',
        ),
      );

      return data;
    } catch (error) {
      console.log('ssoksoskos', error);
      // throw new Error(error);
    }
  }
}
