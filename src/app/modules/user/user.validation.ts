import z from "zod";
import { UserRole } from "./user.interface";

export const UserSchema = z.object({
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

  role: z.enum(UserRole).default(UserRole.USER),

  picture: z.url("Picture must be a valid URL").optional(),

  nidNumber: z
    .string()
    .regex(/^\d+$/, "NID number must contain only digits")
    .optional(),

  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
});
