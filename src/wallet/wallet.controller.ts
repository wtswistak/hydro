import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
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
}
