import { Controller, Get } from '@nestjs/common';
import { FeePredictionService } from './fee-prediction.service';

@Controller('fee-prediction')
export class FeePredictionController {
  constructor(private readonly feePredictionService: FeePredictionService) {}
  @Get()
  getFeePrediction(): Promise<string> {
    return this.feePredictionService.getFeePrediction();
  }
}
