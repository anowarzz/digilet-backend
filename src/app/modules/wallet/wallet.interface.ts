import { Types } from "mongoose";

//  currency can be 'bdt' or 'usd'
export enum CURRENCY {
  BDT = "BDT",
  USD = "USD",
}

export interface IWallet {
  userId: Types.ObjectId;
  walletId: string;
  balance: number;
  currency: CURRENCY;
  isBlocked: boolean;
  isDeleted: boolean;
}
