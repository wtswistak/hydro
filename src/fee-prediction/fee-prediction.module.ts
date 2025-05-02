import { Module } from '@nestjs/common';
import { FeePredictionController } from './fee-prediction.controller';
import { FeePredictionService } from './fee-prediction.service';
import { FeeSnapshotService } from 'src/fee-snapshot/fee-snapshot.service';

@Module({
  controllers: [FeePredictionController],
  providers: [FeePredictionService, FeeSnapshotService],
})
export class FeePredictionModule {}
