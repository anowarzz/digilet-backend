import z from "zod";
import { UserRole, UserStatus } from "./user.interface";

// create user zod schema
export const createUserZodSchema = z.object({
  phone: z
    .string({ error: "Phone Number Is Required" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be  Bangladeshi number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),

  password: z
    .string({ error: "Password Is Required" })
    .min(6, "Password must be at least of 6 character")
    .max(20, "Password can not be more than 20 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/,
      "Password must be at least 6 characters long, include one uppercase letter and one special character."
    ),

  name: z
    .string({ error: "Name Is Required" })
    .min(3, "Name must be at least 3 characters")
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
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be Bangladesh number. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot be more than 20 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/,
      "Password must be at least 6 characters long, include one uppercase letter and one special character."
    )
    .optional(),

  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be less than 25 characters")
    .optional(),

  email: z.email("Invalid email format").optional(),

  userName: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),

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

  isDeleted: z.boolean().optional(),

  isVerified: z.boolean().optional(),
});
