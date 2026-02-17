import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  MempoolUtxo,
  MempoolFeeEstimate,
  MempoolTransaction,
} from '../types/mempool-api.interface';

@Injectable()
export class MempoolService {
  private readonly logger = new Logger(MempoolService.name);

  constructor(private readonly httpService: HttpService) {}

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    payload?: string,
  ): Promise<T> {
    try {
      this.logger.debug(`${method} ${endpoint}`);

      if (method === 'POST') {
        const response = await firstValueFrom(
          this.httpService.post<T>(endpoint, payload, {
            headers: { 'Content-Type': 'text/plain' },
          }),
        );
        return response.data;
      }

      const response = await firstValueFrom(this.httpService.get<T>(endpoint));
      return response.data;
    } catch (error) {
      this.logger.error(`Mempool API error: ${error.message}`);
      throw new HttpException(
        `Mempool API error: ${error.response?.data || error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Get UTXOs for an address (needed for building transactions)
   */
  async getUtxos(address: string): Promise<MempoolUtxo[]> {
    return this.request<MempoolUtxo[]>(`/address/${address}/utxo`);
  }

  /**
   * Get recommended fee rates in sat/vB
   */
  async getFeeEstimates(): Promise<MempoolFeeEstimate> {
    return this.request<MempoolFeeEstimate>('/v1/fees/recommended');
  }

  /**
   * Broadcast a raw transaction hex
   * @returns transaction ID (txid)
   */
  async broadcastTransaction(txHex: string): Promise<string> {
    return this.request<string>('/tx', 'POST', txHex);
  }

  async getTransaction(txid: string): Promise<MempoolTransaction> {
    return this.request<MempoolTransaction>(`/tx/${txid}`);
  }

  /**
   * Get raw transaction hex
   */
  async getRawTransaction(txid: string): Promise<string> {
    return this.request<string>(`/tx/${txid}/hex`);
  }
}
