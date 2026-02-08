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
import { EstimatedFee } from 'src/integrations/blockchain/types/blockchain.types';

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

  @Get('fee/estimated')
  @UseGuards(AuthGuard('jwt'))
  getEstimatedFee(
    @Query() EstimatedFeeDto: GetEstimatedFeeDto,
    @Req() req: AuthRequest,
  ): Promise<EstimatedFee> {
    const userId = req.user.id;
    return this.walletService.getEstimatedFee({
      ...EstimatedFeeDto,
      userId,
    });
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'))
  async getAllWallets(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const wallets = await this.walletService.getWallets({ userId });
    return wallets.map((wallet) => ({
      id: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      balances: wallet.balances.map((balance) => ({
        id: balance.id,
        amount: balance.amount.toString(),
        token: balance.cryptoToken,
      })),
    }));
  }
}
