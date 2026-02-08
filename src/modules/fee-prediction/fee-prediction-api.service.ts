import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FeePredictionApiService {
  private readonly logger = new Logger(FeePredictionApiService.name);
  constructor(private readonly httpService: HttpService) {}
  async getFeePrediction(features: number[]) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<number[]>('predict', {
          features,
        }),
      );

      return data;
    } catch (error) {
      this.logger.error(`Error getting fee prediction: ${error.message}`);
      throw new HttpException(
        'Service unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
