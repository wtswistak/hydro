export interface MempoolFeeEstimate {
  fastestFee: number; // sat/vB
  halfHourFee: number; // sat/vB
  hourFee: number; // sat/vB
  economyFee: number; // sat/vB
  minimumFee: number; // sat/vB
}
