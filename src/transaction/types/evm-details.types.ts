export interface UpdateEvmDetailsData {
  gasUsed?: bigint;
  gasPrice?: bigint;
  effectiveGasPrice?: bigint;
}

export interface CreateEvmDetailsData {
  transactionId: number;
  nonce?: number;
  gasLimit?: bigint;
  gasPrice?: bigint;
  effectiveGasPrice?: bigint;
  gasUsed?: bigint;
}