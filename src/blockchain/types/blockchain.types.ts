export interface SendTransactionPayload {
  receiverAddress: string;
  amount: string;
  privateKey: string;
  contractAddress?: string | null;
  decimals?: number;
}
