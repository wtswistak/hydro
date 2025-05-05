import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as ort from 'onnxruntime-node';
import { FeeSnapshotService } from 'src/fee-snapshot/fee-snapshot.service';

@Injectable()
export class FeePredictionService implements OnModuleInit {
  private session!: ort.InferenceSession;
  private readonly logger = new Logger(FeePredictionService.name);
  constructor(private readonly feeSnapshotService: FeeSnapshotService) {}

  async onModuleInit() {
    this.session = await ort.InferenceSession.create(
      './src/ml-models/eth_fee_model_v2.onnx',
    );
    this.logger.log('ONNX model loaded successfully ✅');
  }

  async getFeePrediction(): Promise<number> {
    const snapshots = await this.feeSnapshotService.getLastFeeSnapshots({
      take: 5,
    });

    const latest = snapshots[0];

    /* rolling‑mean i std z ostatnich 5 snapshotów */
    const baseFeeArr = snapshots.map((s) => Number(s.baseFeePerGas));
    const baseFeeMean5 =
      baseFeeArr.reduce((sum, v) => sum + v, 0) / baseFeeArr.length;

    const baseFeeStd5 = Math.sqrt(
      baseFeeArr
        .map((v) => Math.pow(v - baseFeeMean5, 2))
        .reduce((s, v) => s + v, 0) / baseFeeArr.length,
    );

    /* różnica między 90‑ a 10‑percentylem tipów */
    const priorityGap =
      Number(latest.priorityFee90) - Number(latest.priorityFee10);

    /* budowa dokładnie 8‑elementowy wektor cech  */
    const inputVector = Float32Array.from([
      Number(latest.baseFeePerGas),
      latest.gasUsedRatio,
      Number(latest.priorityFee10),
      Number(latest.priorityFee50),
      Number(latest.priorityFee90),
      baseFeeMean5,
      baseFeeStd5,
      priorityGap,
    ]);

    const tensor = new ort.Tensor('float32', inputVector, [1, 8]);
    const feeds = { float_input: tensor }; // nazwa musi odpowiadać initial_type

    // predykcja
    const results = await this.session.run(feeds);

    // jedyny output ma zwykle nazwę 'output'
    const predictedFee = results.output.data[0] as number; // w gwei

    return predictedFee;
  }
}
