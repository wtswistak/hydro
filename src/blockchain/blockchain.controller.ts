import { Body, Controller, Get, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SendTransactionDto } from './dto/send-transaction.dto';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get()
  getBlockNumber() {
    return this.blockchainService.getBlockNumber();
  }

  @Post('send-transaction-by-wallet')
  sendTransactionByPrivateWallet(
    @Body() sendTransactionDto: SendTransactionDto,
  ) {
    return this.blockchainService.sendTransactionByPrivateWallet(
      sendTransactionDto,
    );
  }

  @Post('create-wallet')
  createWallet() {
    return this.blockchainService.createWallet();
  }
}
