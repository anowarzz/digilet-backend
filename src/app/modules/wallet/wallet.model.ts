import { model, Schema } from "mongoose";
import { CURRENCY, IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    walletId: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
    },
    currency: {
      type: String,
      enum: Object.values(CURRENCY),
      default: CURRENCY.BDT,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
