import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class MempoolApiService {
  private readonly logger = new Logger(MempoolApiService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.baseUrl = this.appConfigService.mempoolApiUrl;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    payload?: string,
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      this.logger.debug(`${method} ${url}`);

      if (method === 'POST') {
        const response = await firstValueFrom(
          this.httpService.post<T>(url, payload, {
            headers: { 'Content-Type': 'text/plain' },
          }),
        );
        return response.data;
      }

      const response = await firstValueFrom(this.httpService.get<T>(url));
      return response.data;
    } catch (error) {
      this.logger.error(`Mempool API error: ${error.message}`);
      throw new HttpException(
        `Mempool API error: ${error.response?.data || error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
