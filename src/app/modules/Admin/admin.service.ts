import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { Transaction } from "../transaction/transaction.model";
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

/*/ get all users /*/
const getAllUsers = async () => {
  const users = await User.find({ isDeleted: false }).select("-password");

  const totalUsers = await User.countDocuments({ isDeleted: false });

  return {
    meta: {
      total: totalUsers,
    },
    data: users,
  };
};

// --------------------------------------//

/*/ get single user  /*/
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return user;
};

// ------------------------------- //

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

// -----------------------------------//
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

// -----------------------------------//
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

// -----------------------------------//
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

// -----------------------------------//

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

// -----------------------------------//
/*/ Get all wallets /*/
const getAllWallets = async () => {
  const wallets = await Wallet.find({});
  if (!wallets || wallets.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No Wallets Found");
  }
  return wallets;
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
  getAllTransactions,
};
