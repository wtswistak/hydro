export interface CreateBtcDetailsData {
  transactionId: number;
  txid?: string;
  vout?: number;
  vsize?: number;
  weight?: number;
  feeRate?: number;
  feeSatoshis?: bigint;
  confirmations?: number;
  inputs?: any;
  outputs?: any;
}
