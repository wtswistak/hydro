import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  providers: [BlockchainService, AppConfigService],
  controllers: [BlockchainController],
})
export class BlockchainModule {}
