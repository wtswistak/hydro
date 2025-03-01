import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from '@prisma/client';
import { CreateTxDto } from './dto/create-tx.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  createWallet(
    @Req() req: any,
    @Body() { blockchain }: CreateWalletDto,
  ): Promise<Wallet> {
    const userId = req.user.id;
    return this.walletService.createWallet({ userId, blockchain });
  }

  @Get('balance')
  @UseGuards(AuthGuard('jwt'))
  getBalance(@Req() req: any): Promise<string> {
    const userId = req.user.id;
    return this.walletService.getBalance({ userId });
  }

  @Post('transaction')
  @UseGuards(AuthGuard('jwt'))
  createTransaction(@Req() req: any, @Body() createTxDto: CreateTxDto) {
    const userId = req.user.id;
    return this.walletService.createTransaction({
      userId,
      ...createTxDto,
    });
  }
}
