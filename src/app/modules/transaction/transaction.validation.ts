import { z } from "zod";
import { TransactionStatus, TransactionType } from "./transaction.interface";

// generic transaction schema
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

/*/    /*/

// ADD_MONEY: user adds money to their own wallet from agent wallet
export const addMoneyTransactionZodSchema = z.object({
  agentPhone: z
    .string("agentPhone - The Agent Phone Number Is Required")
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Agent Phone number must be valid Phone number for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),

  amount: z
    .number("amount - Add Money Amount Is Required")
    .min(1, "Amount must be more than 0"),
  description: z.string().optional(),
});



// WITHDRAW: user withdraws money to agent wallet
export const withdrawTransactionZodSchema = z.object({
  agentPhone: z
    .string(
      "agentPhone - Money Destination or The Agent Phone Number Is Required"
    )
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Agent Phone number must be valid Phone number for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  amount: z
    .number("amount - Withdraw Amount Is Required")
    .min(1, "Amount must be more than 0"),
  description: z.string().optional(),
});




// SEND_MONEY: user sends money to another user
export const sendMoneyTransactionZodSchema = z.object({
  receiverPhone: z
    .string(
      "receiverPhone - Money Destination or The User Phone Number Is Required"
    )
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Wallet number must be valid Phone number for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  amount: z
    .number("amount - Send Money Amount Is Required")
    .min(1, "Amount must be more than 0"),
  description: z.string().optional(),
});



// CASH_IN: agent adds money to user's wallet
export const cashInTransactionZodSchema = z.object({
  userPhone: z
    .string(
      "userPhone - Money Destination or The User Phone Number Is Required"
    )
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Wallet number must be valid Phone number for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  amount: z
    .number("amount - Cash In Amount Is Required")
    .min(1, "Amount must be more than 0"),
  description: z.string().optional(),
});




// CASH_OUT: agent withdraws money from user
export const cashOutTransactionZodSchema = z.object({
  userPhone: z
    .string("userPhone - Money Source or The User Phone Number Is Required")
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Wallet number must be valid Phone number for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
  amount: z
    .number("amount - Cash Out Amount Is Required")
    .min(1, "Amount must be more than 0"),
  description: z.string().optional(),
});
