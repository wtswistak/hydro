export interface CreateBtcDetailsData {
  transactionId: number;
  vsize?: number;
  weight?: number;
  feeRate?: number;
  feeSatoshis?: bigint;
  confirmations?: number;
  inputs?: any;
  outputs?: any;
}
