import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, UserRole, UserStatus } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { versionKey: false, _id: false }
);

const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: [true, "This phone number is already registered"],
    },
    password: { type: String, required: [true, "Password is required"] },
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, unique: true },
    userName: { type: String, unique: true },
    auths: [authProviderSchema],
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    picture: { type: String },
    nidNumber: { type: String },
    address: { type: String },
    status: {
      type: String,
      enum: Object.values(UserStatus),
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>("User", userSchema);
