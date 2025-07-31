import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { getTransactionId } from "../../utils/generateIDs";
import { UserRole, UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "./transaction.interface";
import { Transaction } from "./transaction.model";
import {
  IAddMoneyPayload,
  ISendMoneyPayload,
  IWithdrawMoneyPayload,
} from "./transaction.types";

/*/  ADD MONEY -> User adds money to own wallet from agent wallet /*/
const addMoney = async (payload: IAddMoneyPayload, userId: string) => {
  const { agentPhone, amount, description = "" } = payload;

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (
      user?.status === UserStatus.BLOCKED ||
      user?.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `This user account is ${user?.status}`
      );
    }

    if (!agentPhone || !amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent phone number and amount are required"
      );
    }

    const userOwnWallet = await Wallet.findOne({ userId: userId }).session(
      session
    );

    if (!userOwnWallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "User wallet not found");
    }

    if (userOwnWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User wallet is blocked, can't do this transaction"
      );
    }

    const sourceAgent = await User.findOne({ phone: agentPhone }).session(
      session
    );

    if (!sourceAgent) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent not found with the given phone number"
      );
    }
    if (sourceAgent.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "The given phone number does not belong to a valid agent wallet"
      );
    }

    const sourceAgentWallet = await Wallet.findOne({
      userId: sourceAgent?._id,
    }).session(session);

    if (!sourceAgentWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Source agent wallet not found"
      );
    }

    if (sourceAgentWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Source agent wallet is blocked"
      );
    }

    // Update the user's wallet balance
    const addAmount = Number(amount);

    if (sourceAgentWallet.balance < addAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Source agent wallet does not have enough balance . current balance is ${sourceAgentWallet.balance}`
      );
    }

    // deduct amount from agent wallet
    const updatedAgentWallet = await Wallet.findByIdAndUpdate(
      sourceAgentWallet._id,
      { $inc: { balance: -addAmount } },
      { session, new: true }
    );

    // add amount to user wallet
    const updatedUserWallet = await Wallet.findByIdAndUpdate(
      userOwnWallet._id,
      { $inc: { balance: addAmount } },
      { session, new: true }
    );

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

    // Create a transaction record
    const transaction = new Transaction(transactionPayload);

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      userWallet: updatedUserWallet,
      agentWallet: updatedAgentWallet,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while addMoney transaction:", error);
    throw error;
  }
};

// ----------------------------------------------------- //

/*/  WITHDRAW MONEY -> User withdraws money from own wallet to agent wallet /*/
const withdrawMoney = async (
  payload: IWithdrawMoneyPayload,
  userId: string
) => {
  const { agentPhone, amount, description = "" } = payload;

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (
      user?.status === UserStatus.BLOCKED ||
      user?.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `This user account is ${user?.status}`
      );
    }

    if (!agentPhone || !amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent phone number and amount are required"
      );
    }

    const userOwnWallet = await Wallet.findOne({ userId: userId }).session(
      session
    );

    if (!userOwnWallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "User wallet not found");
    }

    if (userOwnWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User wallet is blocked, can't do this transaction"
      );
    }

    const targetAgent = await User.findOne({ phone: agentPhone }).session(
      session
    );

    if (!targetAgent) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent not found with the given phone number"
      );
    }
    if (targetAgent.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "The given phone number does not belong to a valid agent wallet"
      );
    }

    const targetAgentWallet = await Wallet.findOne({
      userId: targetAgent?._id,
    }).session(session);

    if (!targetAgentWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Target agent wallet not found"
      );
    }

    if (targetAgentWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Target agent wallet is blocked"
      );
    }

    // Validate user's wallet balance
    const withdrawAmount = Number(amount);

    if (userOwnWallet.balance < withdrawAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `User wallet does not have enough balance. Current balance is ${userOwnWallet.balance}`
      );
    }

    // deduct amount from user wallet
    const updatedUserWallet = await Wallet.findByIdAndUpdate(
      userOwnWallet._id,
      { $inc: { balance: -withdrawAmount } },
      { session, new: true }
    );

    // add amount to agent wallet
    const updatedAgentWallet = await Wallet.findByIdAndUpdate(
      targetAgentWallet._id,
      { $inc: { balance: withdrawAmount } },
      { session, new: true }
    );

    // transaction payloads
    const transactionPayload: ITransaction = {
      transactionType: TransactionType.WITHDRAW,
      transactionId: getTransactionId(),
      initiatedBy: new Types.ObjectId(userId),
      fromWallet: userOwnWallet._id,
      toWallet: targetAgentWallet._id,
      amount: withdrawAmount,
      status: TransactionStatus.COMPLETED,
      description,
    };

    // Create a transaction record
    const transaction = new Transaction(transactionPayload);

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      userWallet: updatedUserWallet,
      agentWallet: updatedAgentWallet,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while withdrawMoney transaction:", error);
    throw error;
  }
};



export const transactionServices = {
  addMoney,
  withdrawMoney,
};
