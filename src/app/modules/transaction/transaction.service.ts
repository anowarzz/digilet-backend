import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "./transaction.model";

/*/ Get transaction history for a user or agent /*/
const getTransactionHistory = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    user.status === UserStatus.BLOCKED ||
    user.status === UserStatus.SUSPENDED
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `This user account is ${user.status}`
    );
  }

  const userWallet = await Wallet.findOne({ userId });
  if (!userWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
  }

  const query = {
    $or: [{ fromWallet: userWallet._id }, { toWallet: userWallet._id }],
  };

  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalTransactions = await Transaction.countDocuments(query);

  const totalPages = Math.ceil(totalTransactions / limit);

  return {
    meta: {
      totalTransactions,
      currentPage: page,
      totalPages,
      limit,
    },
    transactions,
  };
};

export const transactionServices = {
  getTransactionHistory,
};
