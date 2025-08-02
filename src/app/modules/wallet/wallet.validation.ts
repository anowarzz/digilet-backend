import { z } from "zod";

// create wallet zod schema
export const createWalletZodSchema = z.object({
  userId: z.string("User ID is required"),
  walletId: z.string("Wallet ID is required"),
  balance: z.number().min(0, "Balance must be a positive number").default(50),
  currency: z.enum(["BDT", "USD"]).default("BDT"),
  isBlocked: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
});

// update wallet zod schema
export const updateWalletZodSchema = z.object({
  walletId: z.string().optional(),
  balance: z.number().min(0, "Balance must be a positive number").optional(),
  currency: z.enum(["BDT", "USD"]).optional(),
  isBlocked: z.boolean().default(false).optional(),
  isDeleted: z.boolean().default(false).optional(),
});

/*/  WALLET TRANSACTIONS VALIDATION ZOD SCHEMA  /*/

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

// ADMIN_TOPUP: admin adds balance to any wallet
export const addBalanceZodSchema = z.object({
  amount: z
    .number("amount - Balance Amount Is Required")
    .min(1, "Amount must be more than 0"),
  description: z.string().optional(),
});
