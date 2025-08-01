/* eslint-disable no-console */
import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { IAuthProvider, IUser, UserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      console.log("Super Admin Already Exist");
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD as string,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_PHONE as string,
    };

    const superAdminPayload: IUser = {
      phone: envVars.SUPER_ADMIN_PHONE as string,
      name: "Super Admin",
      email: envVars.SUPER_ADMIN_EMAIL,
      role: UserRole.ADMIN,
      password: hashedPassword,
      auths: [authProvider],
      isVerified: true,
    };

    console.log("Creating super admin ...");

    const superAdmin = await User.create(superAdminPayload);

    console.log(superAdmin);
    console.log("Super admin created successfully ! \n");
  } catch (error) {
    console.log(error);
  }
};
