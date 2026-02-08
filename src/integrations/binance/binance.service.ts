import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BinanceService {
  constructor(private readonly httpService: HttpService) {}
  async getCryptocurrencies() {
    try {
      const data = await firstValueFrom(
        this.httpService.get('coins/markets/?vs_currency=usd'),
      );
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
}
