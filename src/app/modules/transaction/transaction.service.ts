import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { getTransactionId } from "../../utils/generateIDs";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";
import { Transaction } from "./transaction.model";

const addMoney = async (payload: Partial<ITransaction>, userId: string) => {
  const {
    fromWallet: userPhone,
    amount,
    description = "",
  } = payload as Partial<ITransaction>;

  const user = await User.findById({ _id: userId });
  const userOwnWallet = await Wallet.findOne({ userId: userId });

  const sourceAgent = await User.findOne({ phone: userPhone });
  const sourceAgentWallet = await Wallet.findOne({ userId: sourceAgent?._id });

  if (
    user?.status === UserStatus.BLOCKED ||
    user?.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `This user account is ${user?.status}`
    );
  }

  if (!userOwnWallet) {
    throw new AppError(httpStatus.BAD_REQUEST, "User wallet not found");
  }

  if (!sourceAgent) {
    throw new AppError(httpStatus.BAD_REQUEST, "Source agent not found");
  }

  if (!sourceAgentWallet) {
    throw new AppError(httpStatus.BAD_REQUEST, "Source agent wallet not found");
  }

  // Update the user's wallet balance

  const addAmount = Number(amount);

  userOwnWallet.balance += addAmount;
  await userOwnWallet.save();

  // Update the source agent's wallet balance
  sourceAgentWallet.balance -= addAmount;
  await sourceAgentWallet.save();

  // transaction payloads
  const transactionPayload: ITransaction = {
    transactionType: TransactionType.ADD_MONEY,
    transactionId: getTransactionId(),
    initiatedBy: new Types.ObjectId(userId),
    fromWallet: sourceAgentWallet._id,
    toWallet: userOwnWallet._id,
    amount: addAmount,
    status: TransactionStatus.COMPLETED,
    description,
  };

  // Create a transaction record (if needed)
  const transaction = new Transaction(transactionPayload);

  await transaction.save();

  return {
    userWallet: userOwnWallet,
    sourceAgentWallet,
    transaction,
  };
};

export const transactionServices = {
  addMoney,
};
