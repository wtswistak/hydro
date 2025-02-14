import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';
import { Wallet } from '@prisma/client';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createWallet(@Req() req: any): Promise<Wallet> {
    const userId = req.user.id;
    return this.walletService.createWallet({ userId });
  }

  @Get('balance')
  @UseGuards(AuthGuard('jwt'))
  getBalance(@Req() req: any): Promise<string> {
    const userId = req.user.id;
    return this.walletService.getBalance({ userId });
  }

  @Post('transaction')
  @UseGuards(AuthGuard('jwt'))
  createTransaction(@Req() req: any, @Body() { receiverAddress, amount }) {
    const userId = req.user.id;
    return this.walletService.createTransaction({
      userId,
      receiverAddress,
      amount,
    });
  }
}
