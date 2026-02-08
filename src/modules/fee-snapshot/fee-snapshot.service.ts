import { Injectable, Logger } from '@nestjs/common';
import { FeeSnapshot } from '@prisma/client';
import { EvmService } from 'src/integrations/evm/evm.service';
import { PrismaService } from 'src/core/database/prisma/prisma.service';

@Injectable()
export class FeeSnapshotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evmService: EvmService,
  ) {}

  async createFeeSnapshotJob() {
    const feeHistory = await this.evmService.getFeeHistory(
      50,
      [10, 50, 90],
    );
    const oldestBlock = parseInt(feeHistory.oldestBlock, 16);
    const feeSnapshot = feeHistory.gasUsedRatio.map((gasUsedRatio, i) => ({
      blockNumber: oldestBlock + i,
      baseFeePerGas: BigInt(feeHistory.baseFeePerGas[i]),
      gasUsedRatio,
      priorityFee10: BigInt(feeHistory.reward[i][0]),
      priorityFee50: BigInt(feeHistory.reward[i][1]),
      priorityFee90: BigInt(feeHistory.reward[i][2]),
    }));
    await this.createFeeSnapshots(feeSnapshot);
  }

  createFeeSnapshots(data: FeeSnapshot[]) {
    return this.prisma.feeSnapshot.createMany({
      data,
      skipDuplicates: true,
    });
  }

  getLastFeeSnapshots({ take = 1 }: { take?: number }) {
    return this.prisma.feeSnapshot.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take,
    });
  }
}
