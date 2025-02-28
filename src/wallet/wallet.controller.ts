import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from '@prisma/client';
import { CreateTxDto } from './dto/create-tx.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtRefreshGuard } from 'src/middleware/jwt-refresh.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(JwtRefreshGuard)
  createWallet(
    @Req() req: any,
    @Body() { blockchain }: CreateWalletDto,
  ): Promise<Wallet> {
    const userId = req.user.id;
    return this.walletService.createWallet({ userId, blockchain });
  }

  @Get('balance')
  @UseGuards(JwtRefreshGuard)
  getBalance(@Req() req: any): Promise<string> {
    const userId = req.user.id;
    return this.walletService.getBalance({ userId });
  }

  @Post('transaction')
  @UseGuards(JwtRefreshGuard)
  createTransaction(@Req() req: any, @Body() createTxDto: CreateTxDto) {
    const userId = req.user.id;
    return this.walletService.createTransaction({
      userId,
      ...createTxDto,
    });
  }
}
