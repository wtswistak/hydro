import { Injectable } from '@nestjs/common';
import { ethers, JsonRpcProvider } from 'ethers';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class BlockchainService {
  private provider = new JsonRpcProvider();

  constructor(private readonly configService: AppConfigService) {
    this.provider = new JsonRpcProvider(configService.ethNodeUrl);
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }
}
