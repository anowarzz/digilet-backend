import { z } from "zod";
import { TransactionStatus, TransactionType } from "./transaction.interface";

// transaction zod  schema
export const createTransactionZodSchema = z.object({
  transactionType: z.enum([...(Object.values(TransactionType) as [string])]),
  transactionId: z.string().optional(),
  initiatedBy: z.string(),
  fromWallet: z.string(),
  toWallet: z.string(),
  status: z.enum([...(Object.values(TransactionStatus) as [string])]),
  amount: z.number().min(0, "Amount must be a positive number"),
  fee: z.number().optional(),
  description: z.string().optional(),
});



