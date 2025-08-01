import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { Wallet } from "./wallet.model";

/*/ get user wallety => get my wallet /*/
const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
  }
  return wallet;
};

export const WalletService = {
  getMyWallet,
};
