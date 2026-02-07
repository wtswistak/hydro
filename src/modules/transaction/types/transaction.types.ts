import { TransactionStatus } from "@prisma/client";

export interface CreateTransactionData {
  amount: string;
  status: TransactionStatus;
  receiverAddress: string;
  senderAddress: string;
  hash: string;
  blockchainId: number;
  senderBalanceId?: number;
  receiverBalanceId?: number | null;
}