import httpStatus from "http-status-codes";
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const { phone, password, role, ...userData } = payload;

  const isUserExist = await User.findOne({ phone });

  if (isUserExist) {
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

// get all users
const getAllUsers = async () => {
  const users = await User.find({});

  const totalUsers = await User.countDocuments({});

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

// get single user
const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const { password: pass, ...rest } = user.toObject();

  return rest;
};

export const userServices = {
  createUser,
  getAllUsers,
  getSingleUser,
};
