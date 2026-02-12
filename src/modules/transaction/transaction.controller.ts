import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { BigIntInterceptor } from 'src/core/interceptor/big-int.interceptor';
import { AuthRequest } from 'src/utils/interface';
import { CreateTxDto } from 'src/modules/wallet/dto/create-tx.dto';
import { Transaction } from '@prisma/client';
import { EstimatedFee } from 'src/integrations/evm/types/evm.types';
import { GetEstimatedFeeDto } from './dto/get-estimated-fee.dto';

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

  @Get('fee/estimated')
  @UseGuards(AuthGuard('jwt'))
  getEstimatedFee(
    @Query() EstimatedFeeDto: GetEstimatedFeeDto,
    @Req() req: AuthRequest,
  ): Promise<EstimatedFee> {
    const userId = req.user.id;
    return this.transactionService.getEstimatedFee({
      ...EstimatedFeeDto,
      userId,
    });
  }
}
