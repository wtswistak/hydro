import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { BigIntInterceptor } from 'src/common/big-int.interceptor';
import { AuthRequest } from 'src/utils/interface';
import { CreateTxDto } from 'src/wallet/dto/create-tx.dto';
import { Transaction } from '@prisma/client';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseInterceptors(BigIntInterceptor)
  @UseGuards(AuthGuard('jwt'))
  createTransaction(
    @Req() req: AuthRequest,
    @Body() createTxDto: CreateTxDto,
  ): Promise<Transaction> {
    const userId = req.user.id;
    return this.transactionService.createTransaction({
      userId,
      ...createTxDto,
    });
  }
}
