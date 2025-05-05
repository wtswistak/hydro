import { Module } from '@nestjs/common';
import { FeePredictionController } from './fee-prediction.controller';
import { FeePredictionService } from './fee-prediction.service';
import { FeeSnapshotModule } from 'src/fee-snapshot/fee-snapshot.module';

@Module({
  imports: [FeeSnapshotModule],
  controllers: [FeePredictionController],
  providers: [FeePredictionService],
})
export class FeePredictionModule {}
