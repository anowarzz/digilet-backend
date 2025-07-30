import { Types } from "mongoose";

//  currency can be 'bdt' or 'usd'
export enum CURRENCY {
  BDT = "BDT",
}

export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  walletId: string;
  balance: number;
  currency: CURRENCY;
  isBlocked: boolean;
  isDeleted: boolean;
}
