import { Module } from '@nestjs/common';
import { FeePredictionController } from './fee-prediction.controller';
import { FeePredictionService } from './fee-prediction.service';

@Module({
  controllers: [FeePredictionController],
  providers: [FeePredictionService]
})
export class FeePredictionModule {}
