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
  ICashInPayload,
  ICashOutPayload,
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

// ----------------------------------------------------- //

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
  addMoney,
  sendMoney,
  withdrawMoney,
  cashIn,
  getTransactionHistory,
  cashOut,
};
