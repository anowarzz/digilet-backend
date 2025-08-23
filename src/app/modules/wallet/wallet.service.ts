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
import { Wallet } from "./wallet.model";
import {
  IAddMoneyPayload,
  ISendMoneyPayload,
  IWithdrawMoneyPayload,
} from "./wallet.types";

/*/ get user wallety => get my wallet /*/
const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
  }
  return wallet;
};

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

    if (amount < 5) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Minimum add money amount is ৳5"
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

    // Check if user is trying to add money to themselves
    if (user && user._id.toString() === sourceAgent._id.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot add money to yourself"
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
      throw new AppError(httpStatus.BAD_REQUEST, " Agent wallet not found");
    }

    if (sourceAgentWallet.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, "This agent wallet is blocked");
    }

    // Update the user's wallet balance
    const addAmount = Number(amount);

    if (sourceAgentWallet.balance < addAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `This agent wallet does not have enough balance . current balance is ৳ ${sourceAgentWallet.balance}`
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

    if (amount < 5) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Minimum Withdraw amount is ৳5"
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

    // Check if user is trying to withdraw money to themselves
    if (user && user._id.toString() === targetAgent._id.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot withdraw money to yourself"
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

// ----------------------------------------------------- //

/*/  SEND MONEY -> User sends money from own wallet to another user's wallet /*/
const sendMoney = async (payload: ISendMoneyPayload, userId: string) => {
  const { receiverPhone, amount, description = "" } = payload;

  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const senderUser = await User.findById(userId).session(session);

    if (
      senderUser?.status === UserStatus.BLOCKED ||
      senderUser?.status === UserStatus.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `This user account is ${senderUser?.status}`
      );
    }

    if (!receiverPhone || !amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver phone number and amount are required"
      );
    }

    if (amount < 5) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Minimum Send Money amount is ৳5"
      );
    }

    const senderWallet = await Wallet.findOne({ userId: userId }).session(
      session
    );

    if (!senderWallet) {
      throw new AppError(httpStatus.BAD_REQUEST, "Sender wallet not found");
    }

    if (senderWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Sender wallet is blocked, can't do this transaction"
      );
    }

    const receiverUser = await User.findOne({ phone: receiverPhone }).session(
      session
    );

    if (!receiverUser) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Receiver not found with the given phone number"
      );
    }

    // Check if sender is trying to send money to themselves
    if (
      senderUser &&
      senderUser._id.toString() === receiverUser._id.toString()
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
        `Receiver account is ${receiverUser.status}`
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

    if (senderWallet.balance < sendAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Sender wallet does not have enough balance. Current balance is ${senderWallet.balance}`
      );
    }

    // deduct amount from sender wallet
    const updatedSenderWallet = await Wallet.findByIdAndUpdate(
      senderWallet._id,
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
      transactionType: TransactionType.SEND_MONEY,
      transactionId: getTransactionId(),
      initiatedBy: new Types.ObjectId(userId),
      fromWallet: senderWallet._id,
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
      senderWallet: updatedSenderWallet,
      receiverWallet: updatedReceiverWallet,
      transaction,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while sendMoney transaction:", error);
    throw error;
  }
};

// ----------------------------------------------------- //

export const WalletServices = {
  getMyWallet,
  addMoney,
  withdrawMoney,
  sendMoney,
};
