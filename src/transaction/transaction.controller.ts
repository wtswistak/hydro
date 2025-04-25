import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { BigIntDecimalInterceptor } from 'src/common/big-int-decimal.interceptor';
import { AuthRequest } from 'src/utils/interface';
import { CreateTxDto } from 'src/wallet/dto/create-tx.dto';
import { Transaction } from '@prisma/client';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @UseInterceptors(BigIntDecimalInterceptor)
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

  @Get()
  @UseInterceptors(BigIntDecimalInterceptor)
  @UseGuards(AuthGuard('jwt'))
  getTransactions(@Req() req: AuthRequest): Promise<Transaction[]> {
    const userId = req.user.id;
    console.log('userId', userId);
    return this.transactionService.getTransactionsByUserId({ userId });
  }
}
