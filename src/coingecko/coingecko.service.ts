import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CryptocurrencyDto } from './dto/cryptocurrency.dto';

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  constructor(private readonly httpService: HttpService) {}

  private handleError(error: any, message: string): void {
    const { status, data } = error.response;
    if (data?.error) {
      this.logger.error(`Coingeco API error in ${message}`);
      this.logger.error(`Error: ${data.error}, Status: ${status}`);
    } else {
      this.logger.error(`Unknown error:', ${error}`);
    }

    throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async getCryptocurrencies(): Promise<CryptocurrencyDto[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<CryptocurrencyDto[]>(
          'coins/markets?vs_currency=usd&per_page=10&page=1',
        ),
      );

      return data;
    } catch (error) {
      this.handleError(error, 'getCryptocurrencies');
    }
  }
}
