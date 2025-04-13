import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { AuthRequest } from 'src/utils/interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getBalance(@Req() req: AuthRequest): Promise<string> {
    const userId = req.user.id;
    return this.balanceService.getBalance({ userId });
  }
}
