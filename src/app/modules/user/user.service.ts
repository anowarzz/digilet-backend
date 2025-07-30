/* eslint-disable @typescript-eslint/no-unused-vars */
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const { phone, pin, role, ...userData } = payload;

  const isUserExist = await User.findOne({ phone });

  if (isUserExist) {
    throw new Error("user alreay exist with this phone number");
  }

  const hashedPin = await bcryptjs.hash(
    pin as string,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: phone as string,
  };

  const status = role === "AGENT" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    phone,
    pin: hashedPin,
    role,
    status,
    auths: [authProvider],
    ...userData,
  });

  const { pin: pass, ...rest } = user.toObject();

  return rest;
};

export const userServices = {
  createUser,
};
