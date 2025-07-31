import { Types } from "mongoose";

export interface IAuthProvider {
  provider: "credentials" | "google";
  providerId: string;
}

export enum UserRole {
  USER = "USER",
  AGENT = "AGENT",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export interface IUser {
  _id?: string;
  phone: string;
  password: string;
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
  wallet?: Types.ObjectId;
}
