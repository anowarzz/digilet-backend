import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { UserStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

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

/*/ get single user  /*/
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return user;
};

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

export const adminServices = {
  getAllUsers,
  getSingleUser,
  deleteUser,
};
