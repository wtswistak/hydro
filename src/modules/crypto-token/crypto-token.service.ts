import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma/prisma.service';

@Injectable()
export class CryptoTokenService {
  private readonly logger = new Logger(CryptoTokenService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getCryptoTokenBySymbol({ symbol }: { symbol: string }) {
    return this.prisma.cryptoToken.findUnique({
      where: { symbol },
    });
  }
}
