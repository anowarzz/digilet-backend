import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { getTransactionId } from "../../utils/generateIDs";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { UserRole, UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { ICashInPayload, ICashOutPayload } from "../wallet/wallet.types";

/*/ CASH IN agent adds money to user wallet /*/
const cashIn = async (payload: ICashInPayload, userId: string) => {
  const { userPhone, amount, description = "" } = payload;

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    if (!userPhone || !amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number and amount are required"
      );
    }

    const cashInAgent = await User.findById(userId).session(session);

    if (
      cashInAgent?.status === UserStatus.BLOCKED ||
      cashInAgent?.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `This user account is ${cashInAgent?.status}, can't do this transaction`
      );
    }
    if (cashInAgent?.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only agents can perform cash-in transactions"
      );
    }

    if (cashInAgent.status === UserStatus.PENDING) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This agent account is pending for approval, can't do this transaction now, please wait for approval"
      );
    }

    const cashInAgentWallet = await Wallet.findOne({ userId: userId }).session(
      session
    );

    if (!cashInAgentWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "cash In agent wallet not found"
      );
    }

    if (cashInAgentWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "cash In agent wallet is blocked, can't do this transaction"
      );
    }

    const receiverUser = await User.findOne({ phone: userPhone }).session(
      session
    );

    console.log("Receiver User:", receiverUser);

    if (!receiverUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver not found with the given phone number"
      );
    }

    // Check if cash In agent is trying to send money to themselves
    if (
      cashInAgent &&
      cashInAgent._id.toString() === receiverUser._id.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot send money to yourself"
      );
    }

    if (
      receiverUser.status === UserStatus.BLOCKED ||
      receiverUser.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Receiver account is ${receiverUser.status}, can't do this transaction`
      );
    }

    const receiverWallet = await Wallet.findOne({
      userId: receiverUser._id,
    }).session(session);

    if (!receiverWallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "Receiver wallet not found");
    }

    if (receiverWallet.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet is blocked");
    }

    // Validate sender's wallet balance
    const sendAmount = Number(amount);

    if (cashInAgentWallet.balance < sendAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `cash In agent wallet does not have enough balance. Current balance is ${cashInAgentWallet.balance}`
      );
    }

    // deduct amount from agent wallet
    const updatedAgentWallet = await Wallet.findByIdAndUpdate(
      cashInAgentWallet._id,
      { $inc: { balance: -sendAmount } },
      { session, new: true }
    );

    // add amount to receiver wallet
    const updatedReceiverWallet = await Wallet.findByIdAndUpdate(
      receiverWallet._id,
      { $inc: { balance: sendAmount } },
      { session, new: true }
    );

    // transaction payloads
    const transactionPayload: ITransaction = {
      transactionType: TransactionType.CASH_IN,
      transactionId: getTransactionId(),
      initiatedBy: new Types.ObjectId(userId),
      fromWallet: cashInAgentWallet._id,
      toWallet: receiverWallet._id,
      amount: sendAmount,
      status: TransactionStatus.COMPLETED,
      description,
    };

    // Create a transaction record
    const transaction = new Transaction(transactionPayload);

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      agentWallet: updatedAgentWallet,
      receiverWallet: updatedReceiverWallet,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while cashIn transaction:", error);
    throw error;
  }
};

// ----------------------------------------------------- //

/*/ CASH Out  agent withdraw  money from user wallet /*/
const cashOut = async (payload: ICashOutPayload, userId: string) => {
  const { userPhone, amount, description = "" } = payload;

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    if (!userPhone || !amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number and amount are required"
      );
    }

    const cashOutAgent = await User.findById(userId).session(session);

    if (
      cashOutAgent?.status === UserStatus.BLOCKED ||
      cashOutAgent?.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `This user account is ${cashOutAgent?.status}, can't do this transaction`
      );
    }
    if (cashOutAgent?.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only agents can perform cash-out transactions"
      );
    }

    if (cashOutAgent.status === UserStatus.PENDING) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This agent account is pending for approval, can't do this transaction now, please wait for approval"
      );
    }

    const cashOutAgentWallet = await Wallet.findOne({ userId: userId }).session(
      session
    );

    if (!cashOutAgentWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "cash Out agent wallet not found"
      );
    }

    if (cashOutAgentWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "cash Out agent wallet is blocked, can't do this transaction"
      );
    }

    const targetUser = await User.findOne({ phone: userPhone }).session(
      session
    );

    if (!targetUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Target user wallet not found with the given phone number"
      );
    }

    // Check if cash Out agent is trying to send money to themselves
    if (
      cashOutAgent &&
      cashOutAgent._id.toString() === targetUser._id.toString()
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot send money to yourself"
      );
    }

    if (
      targetUser.status === UserStatus.BLOCKED ||
      targetUser.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Target user account is ${targetUser.status}, can't do this transaction`
      );
    }

    const targetUserWallet = await Wallet.findOne({
      userId: targetUser._id,
    }).session(session);

    if (!targetUserWallet) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Target user wallet not found"
      );
    }

    if (targetUserWallet.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, "Target user wallet is blocked");
    }

    // Validate sender's wallet balance
    const cashOutAmount = Number(amount);

    if (targetUserWallet.balance < cashOutAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Target user wallet does not have enough balance. Current balance is ${targetUserWallet.balance}`
      );
    }

    // deduct amount from target user wallet
    const updatedTargetUserWallet = await Wallet.findByIdAndUpdate(
      targetUserWallet._id,
      { $inc: { balance: -cashOutAmount } },
      { session, new: true }
    );

    // add amount to the agent wallet
    const updatedCashOutAgentWallet = await Wallet.findByIdAndUpdate(
      cashOutAgentWallet._id,
      { $inc: { balance: cashOutAmount } },
      { session, new: true }
    );

    // transaction payloads
    const transactionPayload: ITransaction = {
      transactionType: TransactionType.CASH_OUT,
      transactionId: getTransactionId(),
      initiatedBy: new Types.ObjectId(userId),
      fromWallet: targetUserWallet._id,
      toWallet: cashOutAgentWallet._id,
      amount: cashOutAmount,
      status: TransactionStatus.COMPLETED,
      description,
    };

    // Create a transaction record
    const transaction = new Transaction(transactionPayload);

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      cashOutAgentWallet: updatedCashOutAgentWallet,
      targetUserWallet: updatedTargetUserWallet,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while cashOut transaction:", error);
    throw error;
  }
};

export const agentServices = {
  cashIn,
  cashOut,
};
