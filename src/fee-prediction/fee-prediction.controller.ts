import { Controller, Get } from '@nestjs/common';
import { FeePredictionService } from './fee-prediction.service';
import { FeePrediction } from './interface/get-fee-prediction.interface';

@Controller('fee-prediction')
export class FeePredictionController {
  constructor(private readonly feePredictionService: FeePredictionService) {}

  @Get()
  getFeePrediction(): Promise<FeePrediction[]> {
    return this.feePredictionService.getFeePrediction();
  }
}
