/* eslint-disable @typescript-eslint/no-unused-vars */
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, UserRole } from "./user.interface";
import { User } from "./user.model";

/*/  create user  /*/
const createUser = async (payload: Partial<IUser>) => {
  const { phone, password, role, ...userData } = payload;

  const ifUserExist = await User.findOne({ phone });

  if (ifUserExist) {
    throw new Error("user alreay exist with this phone number");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: phone as string,
  };

  const status = role === "AGENT" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    phone,
    password: hashedPassword,
    role,
    status,
    auths: [authProvider],
    ...userData,
  });

  const { password: pass, ...rest } = user.toObject();

  return rest;
};

/*/ get all users /*/
const getAllUsers = async () => {
  const users = await User.find({ isDeleted: false }).select("-password");

  const totalUsers = await User.countDocuments({ isDeleted: false });

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
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

/*/ get user profile -> get me  /*/
const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  return user;
};

/*/ update a user /*/
const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  // check if user exist with this id
  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User does not exist with this id"
    );
  }

  // prevent user and agent to update role
  if (payload.role) {
    if (
      decodedToken.role === UserRole.USER ||
      decodedToken.role === UserRole.AGENT
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized updating role"
      );
    }
  }

  // prevent user and agent to update status , isVerified, isDeleted
  if (payload.status || payload.isDeleted || payload.isVerified) {
    if (
      decodedToken.role === UserRole.USER ||
      decodedToken.role === UserRole.AGENT
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized for upadating account status"
      );
    }
  }

  // hashing updated password
  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUNDS
    );
  }

  // update operation
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  return updatedUser;
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

export const userServices = {
  createUser,
  getAllUsers,
  getMyProfile,
  deleteUser,
  getSingleUser,
  updateUser,
};
