import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MarketChartDto } from './dto/market-chart.dto';
import { MarketChart } from './interface/market-chart-response';
import { Cryptocurrency } from './interface/cryptocurrency.interface';
import { convertKeysToCamel } from 'src/utils/convert-to-camel';

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

  async getCryptocurrencies(): Promise<Cryptocurrency[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          'coins/markets?vs_currency=usd&per_page=10&page=1',
        ),
      );
      const formatData = convertKeysToCamel(data);

      return formatData;
    } catch (error) {
      this.handleError(error, 'getCryptocurrencies');
    }
  }

  async getMarketChart({ id, days }: MarketChartDto): Promise<MarketChart> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        ),
      );
      const formatData = convertKeysToCamel(data);

      return formatData;
    } catch (error) {
      this.handleError(error, 'getMarketChart');
    }
  }
}
