import { Types } from "mongoose";

export enum TransactionType {
  ADD_MONEY = "ADD_MONEY", // when user adds money themselves
  WITHDRAW = "WITHDRAW", // user withdraws money to agent wallet
  SEND_MONEY = "SEND_MONEY", // user sends money to another user
  CASH_IN = "CASH_IN", // agent adds money to user's wallet
  CASH_OUT = "CASH_OUT", // agent withdraws money from user
  RECEIVE_MONEY = "RECEIVE_MONEY", // user receives money from another user
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export interface ITransaction {
  transactionType: TransactionType;
  transactionId: string;
  initiatedBy: Types.ObjectId;
  senderWallet: string;
  receiverWallet: string;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  description?: string;
}
