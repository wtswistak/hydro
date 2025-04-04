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
import { Wallet } from '@prisma/client';
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
