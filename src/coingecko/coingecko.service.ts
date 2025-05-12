import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MarketChartDto } from './dto/market-chart.dto';
import { MarketChart } from './interface/market-chart-response';
import { Cryptocurrency } from './interface/cryptocurrency.interface';
import { convertKeysToCamel } from 'src/utils/convert-to-camel';
import { FIAT_CURRENCY } from 'src/common/constant';
import Redis from 'ioredis';

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  constructor(
    private readonly httpService: HttpService,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  private handleError(error: any, message: string): void {
    const { status, data } = error?.response;
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

  async getCryptocurrencyRate({ id }: { id: string }): Promise<number> {
    try {
      const cachedRate = await this.redisClient.get(id);
      if (cachedRate) {
        return parseFloat(cachedRate);
      }
      const { data } = await firstValueFrom(
        this.httpService.get(
          `simple/price?ids=${id}&vs_currencies=${FIAT_CURRENCY}`,
        ),
      );
      const rate = data[id].usd;
      await this.redisClient.set(id, rate, 'EX', 3600);

      return rate;
    } catch (error) {
      this.handleError(error, 'getCryptocurrencyRate');
    }
  }
}
