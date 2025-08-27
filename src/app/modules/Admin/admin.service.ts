/* eslint-disable @typescript-eslint/no-explicit-any */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { getTransactionId } from "../../utils/generateIDs";
import { agentSearchableFields } from "../agent/agent.const";
import {
  ITransaction,
  TransactionStatus,
  TransactionType,
} from "../transaction/transaction.interface";
import { Transaction } from "../transaction/transaction.model";
import { userSearchableFields } from "../user/user.const";
import {
  IAuthProvider,
  IUser,
  UserRole,
  UserStatus,
} from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

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
const getAllUsersAndAgents = async (query: Record<string, string>) => {
  const baseFilter = {
    isDeleted: false,
    role: { $in: [UserRole.USER, UserRole.AGENT] },
  };

  // Create QueryBuilder with base filter
  const queryBuilder = new QueryBuilder(
    User.find(baseFilter).select("-password").populate("wallet") as any,
    query
  );

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

// -----------------------------------
// Analytics Overview for admin
const getAnalyticsOverview = async () => {
  // Total users
  const totalUsers = await User.countDocuments({
    isDeleted: false,
    role: UserRole.USER,
  });
  // Total agents
  const totalAgents = await User.countDocuments({
    isDeleted: false,
    role: UserRole.AGENT,
  });
  // Total transactions
  const transactionCount = await Transaction.countDocuments({});
  // Total transaction volume
  const transactionVolumeAgg = await Transaction.aggregate([
    { $group: { _id: null, totalVolume: { $sum: "$amount" } } },
  ]);
  const transactionVolume = transactionVolumeAgg[0]?.totalVolume || 0;
  return {
    totalUsers,
    totalAgents,
    transactionCount,
    transactionVolume,
  };
};

/*/ get all users /*/
const getAllUsers = async (query: Record<string, string>) => {
  const baseFilter = { isDeleted: false, role: UserRole.USER };

  // Create QueryBuilder with base filter
  const queryBuilder = new QueryBuilder(
    User.find(baseFilter).select("-password").populate("wallet") as any,
    query
  );

  const users = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    users.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

// -----------------------------------
/*/ get all agents /*/
const getAllAgents = async (query: Record<string, string>) => {
  const baseFilter = { isDeleted: false, role: UserRole.AGENT };

  // Create QueryBuilder with base filter
  const queryBuilder = new QueryBuilder(
    User.find(baseFilter).select("-password").populate("wallet") as any,
    query
  );

  const agents = queryBuilder
    .search(agentSearchableFields)
    .filter()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    agents.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

// --------------------------------------

/*/ get all admins /*/
const getAllAdmins = async (query: Record<string, string>) => {
  const baseFilter = { isDeleted: false, role: UserRole.ADMIN };

  // Create QueryBuilder with base filter
  const queryBuilder = new QueryBuilder(
    User.find(baseFilter).select("-password").populate("wallet") as any,
    query
  );

  const admins = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    admins.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};

// --------------------------------------
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId)
    .populate("wallet")
    .select("-password");

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

  // Ensure payload is an object, default to empty object if undefined
  const updateData = payload || {};

  // If password is being updated, hash it
  if (updateData.password) {
    updateData.password = await bcryptjs.hash(
      updateData.password as string,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user"
    );
  }

  return updatedUser;
};

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

// -------------------------------
/*/  delete an admin /*/
const deleteAdmin = async (adminId: string) => {
  const admin = await User.findById(adminId);

  if (!admin) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Admin does not exist with this id"
    );
  }

  if (admin.role !== UserRole.ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "The specified user is not an admin"
    );
  }

  const deletedAdmin = await User.findByIdAndUpdate(
    adminId,
    { isDeleted: true, status: UserStatus.SUSPENDED },
    { new: true }
  ).select("-password");

  return { deletedAdmin: deletedAdmin };
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
/*/ block user /*/
const blockUser = async (userId: string) => {
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
        "Cannot block non-regular users"
      );
    }

    if (user.isDeleted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This user is already deleted"
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This user is already blocked"
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
    console.error("Error while blocking user:", error);
    throw error;
  }
};

// -----------------------------------
/*/ unblock user /*/
const unblockUser = async (userId: string) => {
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
        "Cannot unblock non-regular users"
      );
    }

    if (user.isDeleted) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "This user is already deleted"
      );
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new AppError(httpStatus.BAD_REQUEST, "This user is already active");
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
    console.error("Error while unblocking user:", error);
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

// -------------------------
/**
 * Reject an agent request: set role to USER and status to ACTIVE
 */
const rejectAgent = async (agentId: string) => {
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  if (agent.role !== UserRole.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "This User is not an agent");
  }
  // Set role to USER and status to ACTIVE
  const updatedUser = await User.findByIdAndUpdate(
    agentId,
    { role: UserRole.USER, status: UserStatus.ACTIVE },
    { new: true, runValidators: true }
  ).select("-password");
  return updatedUser;
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
    if (!amount || amount <= 10) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Amount must be a positive number greater than 0"
      );
    }

    if (amount > 100000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Maximum Balance Amount is 1,00,000"
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
const getAllTransactions = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Transaction.find(), query);

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

// -----------------------------------
/*/ Get all wallets /*/
const getAllWallets = async (query: Record<string, string>) => {
  const baseFilter = { isDeleted: false };
  const searchTerm = query.searchTerm || "";

  // Aggregation pipeline for searching by user name/phone
  const pipeline: any[] = [
    { $match: baseFilter },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { "userInfo.name": { $regex: searchTerm, $options: "i" } },
          { "userInfo.phone": { $regex: searchTerm, $options: "i" } },
        ],
      },
    });
  }

  // Add sorting
  const sort = query.sort || "-createdAt";
  if (sort) {
    // Convert sort to aggregation format
    const sortObj: any = {};
    const sortFields = sort.split(",");
    for (const field of sortFields) {
      const direction = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace(/^-/, "");
      sortObj[fieldName] = direction;
    }
    pipeline.push({ $sort: sortObj });
  }

  // Pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Execute aggregation
  const data = await Wallet.aggregate(pipeline);

  // Meta info
  const totalDocumentsPipeline = [...pipeline];
  // Remove $skip and $limit for count
  const countPipeline = totalDocumentsPipeline.filter(
    (stage) => !stage.$skip && !stage.$limit
  );
  const totalDocumentsArr = await Wallet.aggregate([
    ...countPipeline,
    { $count: "total" },
  ]);
  const total = totalDocumentsArr[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const meta = { page, limit, total, totalPages };

  return {
    meta,
    data,
  };
};

// ----------------------------------------------------- //
/*/ Get User Transactions --> For Admin /*/
const getUserTransactions = async (
  userId: string,
  query: Record<string, string>
) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Get the user's wallet
  const userWallet = await Wallet.findOne({ userId });
  if (!userWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
  }

  const baseQuery = {
    $or: [{ fromWallet: userWallet._id }, { toWallet: userWallet._id }],
  };

  const queryBuilder = new QueryBuilder(
    Transaction.find(baseQuery)
      .populate("fromWallet", "walletId userId")
      .populate("toWallet", "walletId userId")
      .populate("initiatedBy", "name phone"),
    query
  );

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

export const adminServices = {
  createAdmin,
  getAllUsers,
  getAllAgents,
  getAllAdmins,
  getAllUsersAndAgents,
  getSingleUser,
  deleteUser,
  deleteAdmin,
  blockUserWallet,
  unblockUserWallet,
  blockUser,
  unblockUser,
  approveAgent,
  suspendAgent,
  getAllWallets,
  getSingleWallet,
  addBalanceToWallet,
  getAllTransactions,
  getUserTransactions,
  updateUserProfile,
  rejectAgent,
  getAnalyticsOverview,
};
