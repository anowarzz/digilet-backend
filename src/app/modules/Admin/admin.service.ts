import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { User } from "../user/user.model";

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


/*/  delete a user /*/
const deleteUser = async (userId: string) => {
  // check if user exist with this id
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User does not exist with this id"
    );
  }
  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  ).select("-password");

  return deletedUser;
};

export const adminServices = {
  getAllUsers,
  deleteUser,
};
