import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { getTransactionId } from "../../utils/generateIDs";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import {
  IAuthProvider,
  IUser,
  UserRole,
  UserStatus,
} from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";
import { IUserQuery } from "./admin.types";

/*/  create admin /*/
const createAdmin = async (adminData: Partial<IUser>) => {
  // Validate required fields
  if (!adminData.phone || !adminData.password || !adminData.name) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing required admin fields");
  }

  // Check if admin already exists
  const existingAdmin = await User.findOne({
    phone: adminData.phone,
    role: UserRole.ADMIN,
  });
  if (existingAdmin) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Admin already exists with this phone number"
    );
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(
    adminData.password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: adminData.phone,
  };

  const newAdmin = await User.create({
    ...adminData,
    password: hashedPassword,
    role: UserRole.ADMIN,
    auths: [authProvider],
    status: UserStatus.ACTIVE,
    isVerified: true,
  });
  return newAdmin;
};

// -------------------------

/*/ get all users /*/
const getAllUsers = async (filters?: {
  role?: UserRole;
  status?: UserStatus;
}) => {
  // Build query object

  const query: IUserQuery = { isDeleted: false };

  // Add role filter if provided
  if (filters?.role) {
    query.role = filters.role;
  }

  // Add status filter if provided
  if (filters?.status) {
    query.status = filters.status;
  }

  const users = await User.find(query).select("-password");
  const totalUsers = await User.countDocuments(query);

  return {
    meta: {
      total: totalUsers,
      filters: filters || {},
    },
    data: users,
  };
};

// --------------------------------------

/*/ get single user  /*/
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return user;
};

// -----------------------------------
/*/ update a user profile /*/
const updateUserProfile = async (userId: string, payload: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");
  return updatedUser;
};
// Add to export: updateAnyUserProfile

// -------------------------------

/*/  delete a user /*/
const deleteUser = async (userId: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User does not exist with this id"
      );
    }

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, status: UserStatus.SUSPENDED },
      { new: true, session }
    ).select("-password");

    const deletedWallet = await Wallet.findOneAndUpdate(
      { userId: user._id },
      { isDeleted: true, isBlocked: true },
      { new: true, session }
    );

    if (!deletedWallet) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to delete user wallet while soft deleting user"
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { deletedUser: deletedUser, deletedWallet: deletedWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error occured while deleting the user:", error);
    throw error;
  }
};

// -----------------------------------
/*/ block user wallet /*/
const blockUserWallet = async (userId: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== UserRole.USER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot block wallets for non-regular users"
      );
    }

    if (user.isDeleted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This user is already deleted"
      );
    }

    // Set user status to BLOCKED and block their wallet
    const blockedUser = await User.findByIdAndUpdate(
      user._id,
      { status: UserStatus.BLOCKED },
      { new: true, session }
    );

    const blockedUserWallet = await Wallet.findOneAndUpdate(
      { userId: user._id },
      { isBlocked: true },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { blockedUser, blockedUserWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while blocking user's wallet:", error);
    throw error;
  }
};

// -----------------------------------
/*/ unblock user wallet /*/
const unblockUserWallet = async (userId: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (user.role !== UserRole.USER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot unblock wallets for non-regular users"
      );
    }

    if (user.isDeleted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This user is already deleted"
      );
    }

    // Set user status to ACTIVE and unblock their wallet
    const unblockedUser = await User.findByIdAndUpdate(
      user._id,
      { status: UserStatus.ACTIVE },
      { new: true, session }
    );

    const unblockedUserWallet = await Wallet.findOneAndUpdate(
      { userId: user._id },
      { isBlocked: false },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { unblockedUser, unblockedUserWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while unblocking user's wallet:", error);
    throw error;
  }
};

// -----------------------------------
/*/ Approve a agent /*/
const approveAgent = async (agentId: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId).session(session);

    if (!agent) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (agent.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This action is only for agents."
      );
    }

    if (agent.isDeleted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This Agent is already deleted"
      );
    }

    // Set agent status to ACTIVE and unblock their wallet
    const approvedAgent = await User.findByIdAndUpdate(
      agentId,
      { status: UserStatus.ACTIVE },
      { new: true, session }
    );

    const approvedAgentWallet = await Wallet.findOneAndUpdate(
      { userId: agentId },
      { isBlocked: false },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { approvedAgent, approvedAgentWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while approving agent:", error);
    throw error;
  }
};

// -----------------------------------

/*/ Suspend a agent /*/
const suspendAgent = async (agentId: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    const agent = await User.findById(agentId).session(session);

    if (!agent) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (agent.role !== UserRole.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This action is only for agents."
      );
    }

    // Set agent status to SUSPENDED and block their wallet
    const updatedAgent = await User.findByIdAndUpdate(
      agentId,
      { status: UserStatus.SUSPENDED },
      { new: true, session }
    );

    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: agentId },
      { isBlocked: true },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return { updatedAgent, updatedWallet };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error while suspending agent:", error);
    throw error;
  }
};

// -----------------------------------
/*/ Get all wallets /*/
const getAllWallets = async () => {
  const wallets = await Wallet.find({});
  if (!wallets || wallets.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No Wallets Found");
  }
  return wallets;
};

// -----------------------------------
// get single wallet
const getSingleWallet = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }
  return wallet;
};

// -----------------------------------
/*/ ADD BALANCE to wallet  /*/
const addBalanceToWallet = async (
  userId: string,
  payload: { amount: number; description?: string },
  adminUserId: string
) => {
  const { amount, description = "Admin balance top-up" } = payload;
  const session = await Wallet.startSession();
  session.startTransaction();

  try {
    if (!amount || amount <= 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Amount must be a positive number greater than 0"
      );
    }

    // Find the target user
    const targetUser = await User.findById(userId).session(session);

    if (!targetUser) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (targetUser.isDeleted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot add balance to a deleted user account"
      );
    }

    if (
      targetUser.status === UserStatus.SUSPENDED ||
      targetUser.status === UserStatus.BLOCKED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Cannot add balance to ${targetUser.status.toLowerCase()} user account`
      );
    }

    // Find the target user's wallet
    const targetWallet = await Wallet.findOne({
      userId: targetUser._id,
    }).session(session);

    if (!targetWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }

    if (targetWallet.isBlocked) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot add balance to blocked wallet"
      );
    }

    if (targetWallet.isDeleted) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Cannot add balance to deleted wallet"
      );
    }

    // Add the amount to the target wallet
    const addAmount = Number(amount);
    const updatedWallet = await Wallet.findByIdAndUpdate(
      targetWallet._id,
      { $inc: { balance: addAmount } },
      { session, new: true }
    );

    // Create a transaction record for admin top-up
    const transactionPayload: ITransaction = {
      transactionType: TransactionType.ADMIN_TOPUP,
      transactionId: getTransactionId(),
      initiatedBy: new Types.ObjectId(adminUserId),
      fromWallet: targetWallet._id,
      toWallet: targetWallet._id,
      amount: addAmount,
      status: TransactionStatus.COMPLETED,
      description: `${description} - ${addAmount} ${targetWallet.currency} added to ${targetUser.name}'s wallet`,
    };

    const transaction = new Transaction(transactionPayload);
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      updatedWallet,
      transaction,
      targetUser: {
        id: targetUser._id,
        name: targetUser.name,
        phone: targetUser.phone,
        role: targetUser.role,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ----------------------------------------------------- //
/*/ Get All Transactions --> For Admin /*/
const getAllTransactions = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalTransactions = await Transaction.countDocuments();

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

export const adminServices = {
  createAdmin,
  getAllUsers,
  getSingleUser,
  deleteUser,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  suspendAgent,
  getAllWallets,
  getSingleWallet,
  addBalanceToWallet,
  getAllTransactions,
  updateUserProfile,
};
