import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { formatEther } from 'ethers';
import * as ort from 'onnxruntime-node';
import { FeeSnapshotService } from 'src/fee-snapshot/fee-snapshot.service';
import { FeePrediction } from './interface/get-fee-prediction.dto';

@Injectable()
export class FeePredictionService implements OnModuleInit {
  private session!: ort.InferenceSession;
  private readonly logger = new Logger(FeePredictionService.name);
  constructor(private readonly feeSnapshotService: FeeSnapshotService) {}

  async onModuleInit() {
    this.session = await ort.InferenceSession.create(
      './src/fee-prediction/ml-models/eth_fee_model_v2.onnx',
    );
    this.logger.log('ONNX model loaded successfully ✅');
  }

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

      const feeds = { float_input: new ort.Tensor('float32', input, [1, 8]) };
      const results = await this.session.run(feeds);
      const outName = Object.keys(results)[0];
      const rawPred = (results[outName].data as Float32Array)[0];
      const gasPriceGwei = Number(rawPred.toFixed(6));

      const gasPriceWeiBig = BigInt(Math.round(gasPriceGwei * 1e9));
      const gasLimitBig = BigInt(21_000);
      const txCostWeiBig = gasPriceWeiBig * gasLimitBig;

      const txCostEth = formatEther(txCostWeiBig);

      forecasts.push({
        minutesAhead: i * 10,
        gasPriceGwei,
        txCostEth,
      });

      // synulacja nowy snapshot
      const synthetic: typeof latest = {
        ...latest,
        baseFeePerGas: BigInt(Math.round(gasPriceGwei * 1e9)),
        createdAt: new Date(latest.createdAt.getTime() + 10 * 60 * 1000),
      };

      snapshots = [synthetic, ...snapshots].slice(0, 5);
    }

    return forecasts;
  }
}
