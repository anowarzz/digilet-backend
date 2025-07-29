export interface IAuthProvider {
  provider: "credentials" | "google";
  providerId: string;
}

export enum UserRole {
  USER = "user",
  AGENT = "agent",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  phone: string;
  pin: string;
  name: string;
  email?: string;
  userName?: string;
  auths?: IAuthProvider[];
  role: UserRole;
  picture?: string;
  nidNumber?: string;
  address?: string;
  status?: UserStatus;
  isVerified?: boolean;
  isDeleted?: boolean;
}
