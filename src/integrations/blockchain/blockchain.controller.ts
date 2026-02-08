import { Body, Controller, Get, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { EvmService } from 'src/integrations/evm/evm.service';
import { SendTransactionDto } from './dto/send-transaction.dto';
import { BlockchainType } from '@prisma/client';

@Controller('blockchain')
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly evmService: EvmService,
  ) {}

  // for dev
  @Post('send-transaction-by-wallet')
  sendTransactionByPrivateWallet(
    @Body() sendTransactionDto: SendTransactionDto,
  ) {
    return this.evmService.sendTransactionByPrivateWallet(sendTransactionDto);
  }

  // for dev
  @Post('create-wallet')
  createWallet() {
    return this.blockchainService.createWallet(BlockchainType.EVM);
  }

  // for dev
  @Get()
  getBlockNumber() {
    return this.evmService.getBlockNumber();
  }
}
