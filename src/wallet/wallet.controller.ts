import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Transaction, Wallet } from '@prisma/client';
import { CreateTxDto } from './dto/create-tx.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthRequest } from 'src/utils/interface';
import { GetEstimatedFeeDto } from './dto/get-estimated-fee.dto';
import { EstimatedFee } from 'src/blockchain/blockchain.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createWallet(
    @Req() req: AuthRequest,
    @Body() { blockchain }: CreateWalletDto,
  ): Promise<Wallet> {
    const userId = req.user.id;
    return this.walletService.createWallet({ userId, blockchain });
  }

  @Get('balance')
  @UseGuards(AuthGuard('jwt'))
  getBalance(@Req() req: AuthRequest): Promise<string> {
    const userId = req.user.id;
    return this.walletService.getBalance({ userId });
  }

  @Post('transaction')
  @UseGuards(AuthGuard('jwt'))
  createTransaction(
    @Req() req: AuthRequest,
    @Body() createTxDto: CreateTxDto,
  ): Promise<Transaction> {
    const userId = req.user.id;
    return this.walletService.createTransaction({
      userId,
      ...createTxDto,
    });
  }

  @Get('fee/estimated')
  @UseGuards(AuthGuard('jwt'))
  getEstimatedFee(
    @Query() EstimatedFeeDto: GetEstimatedFeeDto,
  ): Promise<EstimatedFee> {
    return this.walletService.getEstimatedFee({
      ...EstimatedFeeDto,
    });
  }
}
