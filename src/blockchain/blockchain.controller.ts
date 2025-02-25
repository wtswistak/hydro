import { Body, Controller, Get, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SendTransactionDto } from './dto/send-transaction.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Post('send-transaction-by-wallet')
  sendTransactionByPrivateWallet(
    @Body() sendTransactionDto: SendTransactionDto,
  ) {
    return this.blockchainService.sendTransactionByPrivateWallet(
      sendTransactionDto,
    );
  }
  // for dev
  @Post('create-wallet')
  createWallet() {
    return this.blockchainService.createWallet();
  }
  // for dev
  @Get()
  getBlockNumber() {
    return this.blockchainService.getBlockNumber();
  }
}
