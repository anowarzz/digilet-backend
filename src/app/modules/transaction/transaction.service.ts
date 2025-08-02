import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { Transaction } from "./transaction.model";

/*/ Get transaction history for a user or agent /*/
const getTransactionHistory = async (
  userId: string,
  query: Record<string, string>
) => {
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

  // get transactions with this user's wallet
  const filterQuery = {
    $or: [{ fromWallet: userWallet._id }, { toWallet: userWallet._id }],
  };

  // Create QueryBuilder
  const queryBuilder = new QueryBuilder(Transaction.find(filterQuery), query);

  queryBuilder.filter().sort().paginate();

  const [data, meta] = await Promise.all([
    queryBuilder.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

export const transactionServices = {
  getTransactionHistory,
};
