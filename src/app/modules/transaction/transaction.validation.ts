import { z } from "zod";
import { TransactionStatus, TransactionType } from "./transaction.interface";

export const createTransactionZodSchema = z.object({
  transactionType: z.enum([
    ...(Object.values(TransactionType) as [string, ...string[]]),
  ]),
  transactionId: z.string().optional(),
  initiatedBy: z.string(), 
  senderWallet: z
    .string({ error: "Sender Wallet Number Is Required" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Sender wallet number must be  Bangladesh number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  receiverWallet: z
    .string({ error: "Receiver Wallet Number Is Required" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Receiver wallet number must be  Bangladesh number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  status: z.enum([
    ...(Object.values(TransactionStatus) as [string]),
  ]),
  amount: z.number().min(0, "Amount must be a positive number"),
  fee: z.number().optional(),
  description: z.string().optional(),
});
