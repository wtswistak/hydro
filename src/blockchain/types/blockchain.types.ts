export interface SendTransactionPayload {
  receiverAddress: string;
  amount: string;
  privateKey: string;
  contractAddress?: string | null;
  decimals?: number;
}

export interface EstimatedFeePayload {
  receiverAddress: string;
  amount: string;
  contractAddress?: string | null;
  decimals: number;
  senderAddress?: string;
}

export interface EstimatedFee {
  feeInCrypto: string;
}
