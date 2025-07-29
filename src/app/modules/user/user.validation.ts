import z from "zod";
import { UserRole, UserStatus } from "./user.interface";

// create user zod schema
export const createUserZodSchema = z.object({
  phone: z
    .string({ error: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be  Bangladesh number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),

  pin: z
    .string({ error: "PIN must be string" })
    .min(1, "PIN is required")
    .length(5, "PIN must be exactly 5 characters")
    .regex(/^\d+$/, "PIN must contain only numbers"),

  name: z
    .string({ error: "Name must be string" })
    .min(3, "Name is required")
    .max(25, "Name must be less than 25 characters"),

  email: z.email("Invalid email format").optional(),

  userName: z
    .string({ error: "Username must be string" })
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),

  role: z.enum(Object.values(UserRole) as [string]).optional(),

  picture: z.string("Picture must be a valid URL").optional(),

  nidNumber: z
    .string()
    .regex(/^\d+$/, "NID number must contain only digits")
    .optional(),

  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
});

// update user zod schema

export const updateUserZodSchema = z.object({
  phone: z
    .string({ error: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be  Bangladesh number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),

  pin: z
    .string({ error: "PIN must be string" })
    .min(1, "PIN is required")
    .length(5, "PIN must be exactly 5 characters")
    .regex(/^\d+$/, "PIN must contain only numbers")
    .optional(),

  name: z
    .string({ error: "Name must be string" })
    .min(3, "Name is required")
    .max(25, "Name must be less than 25 characters")
    .optional(),

  email: z.email("Invalid email format").optional(),

  userName: z
    .string({ error: "Username must be string" })
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),

  role: z.enum(Object.values(UserRole) as [string]).optional(),

  picture: z.string("Picture must be a valid URL").optional(),

  nidNumber: z
    .string()
    .regex(/^\d+$/, "NID number must contain only digits")
    .optional(),

  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),

  status: z.enum(Object.values(UserStatus) as [string]).optional(),

  isDeleted: z.boolean({ error: "isDeleted must be true or false" }).optional(),

  isVerified: z
    .boolean({ error: "isVerified must be true or false" })
    .optional(),
});
