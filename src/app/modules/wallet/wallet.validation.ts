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
