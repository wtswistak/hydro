import { Injectable, Logger } from '@nestjs/common';
import { FeeSnapshotService } from 'src/fee-snapshot/fee-snapshot.service';
import { FeePrediction } from './interface/get-fee-prediction.dto';
import { FeePredictionApiService } from './fee-prediction-api.service';

@Injectable()
export class FeePredictionService {
  private readonly logger = new Logger(FeePredictionService.name);
  constructor(
    private readonly feeSnapshotService: FeeSnapshotService,
    private readonly feePredictionApiService: FeePredictionApiService,
  ) {}

  async getFeePrediction(): Promise<FeePrediction[]> {
    let snapshots = await this.feeSnapshotService.getLastFeeSnapshots({
      take: 5,
    });
    const latest = snapshots[0];
    const baseFeeMean5 =
      snapshots.reduce((s, r) => s + Number(r.baseFeePerGas), 0) / 5;
    const baseFeeStd5 = Math.sqrt(
      snapshots.reduce(
        (s, r) => s + Math.pow(Number(r.baseFeePerGas) - baseFeeMean5, 2),
        0,
      ) / 5,
    );
    const priorityGap =
      Number(latest.priorityFee90) - Number(latest.priorityFee10);

    const features = [
      Number(latest.baseFeePerGas),
      latest.gasUsedRatio,
      Number(latest.priorityFee10),
      Number(latest.priorityFee50),
      Number(latest.priorityFee90),
      baseFeeMean5,
      baseFeeStd5,
      priorityGap,
    ];

    const prediction =
      await this.feePredictionApiService.getFeePrediction(features);

    return prediction.map((gwei, i) => ({
      minutesAhead: (i + 1) * 10,
      gasPriceGwei: +gwei.toFixed(6),
    }));
  }
}
