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




// get all wallets  --> ADMIN ONLY
const getAllWallets = async () => {
  const wallets = await Wallet.find({});
  if (!wallets || wallets.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No Wallets Found");
  }
  return wallets;
};

export const WalletService = {
  getMyWallet,
  getAllWallets,
};
