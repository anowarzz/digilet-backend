import { UserRole, UserStatus } from "../user/user.interface";

export interface IUserQuery {
  isDeleted: boolean;
  role?: UserRole;
  status?: UserStatus;
}
