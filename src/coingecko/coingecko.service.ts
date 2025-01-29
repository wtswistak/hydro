import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ICryptocurrency } from './interface/cryptocurrency.interface';

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  constructor(private readonly httpService: HttpService) {}

  async getCryptocurrencies(): Promise<ICryptocurrency[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<ICryptocurrency[]>(
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
