import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { formatEther } from 'ethers';
import { FeeSnapshotService } from 'src/fee-snapshot/fee-snapshot.service';
import { FeePrediction } from './interface/get-fee-prediction.dto';

@Injectable()
export class FeePredictionService {
  private readonly logger = new Logger(FeePredictionService.name);
  constructor(private readonly feeSnapshotService: FeeSnapshotService) {}

  async getFeePrediction(steps: number): Promise<FeePrediction[]> {
    let snapshots = await this.feeSnapshotService.getLastFeeSnapshots({
      take: 5,
    });

    const forecasts: {
      minutesAhead: number;
      gasPriceGwei: number;
      txCostEth: string;
    }[] = [];

    for (let i = 1; i <= steps; i++) {
      const latest = snapshots[0];

      const baseFeeArr = snapshots.map((s) => Number(s.baseFeePerGas));
      const baseFeeMean5 =
        baseFeeArr.reduce((s, v) => s + v, 0) / baseFeeArr.length;
      const baseFeeStd5 = Math.sqrt(
        baseFeeArr
          .map((v) => (v - baseFeeMean5) ** 2)
          .reduce((s, v) => s + v, 0) / baseFeeArr.length,
      );
      const priorityGap =
        Number(latest.priorityFee90) - Number(latest.priorityFee10);

      const input = Float32Array.from([
        Number(latest.baseFeePerGas),
        latest.gasUsedRatio,
        Number(latest.priorityFee10),
        Number(latest.priorityFee50),
        Number(latest.priorityFee90),
        baseFeeMean5,
        baseFeeStd5,
        priorityGap,
      ]);

      const gasPriceWeiBig = BigInt(Math.round(2 * 1e9));
      const gasLimitBig = BigInt(21_000);
      const txCostWeiBig = gasPriceWeiBig * gasLimitBig;

      const txCostEth = formatEther(txCostWeiBig);

      forecasts.push({
        minutesAhead: i * 10,
        gasPriceGwei: 2,
        txCostEth,
      });

      // synulacja nowy snapshot
      const synthetic: typeof latest = {
        ...latest,
        baseFeePerGas: BigInt(Math.round(2 * 1e9)),
        createdAt: new Date(latest.createdAt.getTime() + 10 * 60 * 1000),
      };

      snapshots = [synthetic, ...snapshots].slice(0, 5);
    }

    return forecasts;
  }
}
