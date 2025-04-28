import { Injectable, Logger } from '@nestjs/common';
import { FeeSnapshot } from '@prisma/client';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class FeeSnapshotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createFeeSnapshotJob() {
    const feeHistory = await this.blockchainService.getFeeHistory(
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

  getLastFeeSnapshot() {
    return this.prisma.feeSnapshot.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
