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

//

// ADD_MONEY: user adds money to their own wallet from agent wallet
export const addMoneyTransactionZodSchema = z.object({
  fromWallet: z.string(
    "fromWallet - Money Source or The Agent Wallet Number Is Required"
  ),
  amount: z
    .number("amount - Add Money Amount Is Required")
    .min(0, "Amount must be a positive number"),
  description: z.string().optional(),
});

// WITHDRAW: user withdraws money to agent wallet
export const withdrawTransactionZodSchema = z.object({
  toWallet: z.string(
    " toWallet - Money Destination or The Agent Wallet Number Is Required"
  ),
  amount: z
    .number("amount - Withdraw Amount Is Required")
    .min(0, "Amount must be a positive number"),
  description: z.string().optional(),
});

// SEND_MONEY: user sends money to another user
export const sendMoneyTransactionZodSchema = z.object({
  toWallet: z.string(
    " toWallet - Money Destination or The User Wallet Number Is Required"
  ),
  amount: z
    .number("amount - Send Money Amount Is Required")
    .min(0, "Amount must be a positive number"),
  description: z.string().optional(),
});

// CASH_IN: agent adds money to user's wallet
export const cashInTransactionZodSchema = z.object({
  toWallet: z.string(
    " toWallet - Money Destination or The User Wallet Number Is Required"
  ),
  amount: z
    .number("amount - Cash In Amount Is Required")
    .min(0, "Amount must be a positive number"),
  description: z.string().optional(),
});

// CASH_OUT: agent withdraws money from user
export const cashOutTransactionZodSchema = z.object({
  fromWallet: z.string(
    " fromWallet - Money Source or The User Wallet Number Is Required"
  ),
  amount: z
    .number("amount - Cash Out Amount Is Required")
    .min(0, "Amount must be a positive number"),
  description: z.string().optional(),
});
