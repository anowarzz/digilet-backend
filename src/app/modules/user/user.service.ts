import bcryptjs from "bcryptjs";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";

const createUser = async (payload: Partial<IUser>) => {
  const { phone, pin, role, ...rest } = payload;

  const isUserExist = await User.findOne({ phone });

  if (isUserExist) {
    throw new Error("user alreay exist");
  }

  const hashedPin = await bcryptjs.hash(pin as string, 10);

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: phone as string,
  };

  const status = role === "agent" ? "PENDING" : "ACTIVE";

  const user = await User.create({
    phone,
    pin: hashedPin,
    role,
    status,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

export const userServices = {
  createUser,
};
