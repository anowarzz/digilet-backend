import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

interface EnvConfig {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES: string;
  JWT_REFRESH_EXPIRES: string;
  BCRYPT_SALT_ROUNDS: string;
  FRONTEND_URL?: string;
  INITIAL_WALLET_BALANCE?: string;
  SUPER_ADMIN_PHONE?: string;
  SUPER_ADMIN_EMAIL?: string;
  SUPER_ADMIN_PASSWORD?: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "JWT_ACCESS_EXPIRES",
    "JWT_REFRESH_EXPIRES",
    "BCRYPT_SALT_ROUNDS",
    "FRONTEND_URL",
    "INITIAL_WALLET_BALANCE",
    "SUPER_ADMIN_PHONE",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    INITIAL_WALLET_BALANCE: process.env.INITIAL_WALLET_BALANCE as string,
    SUPER_ADMIN_PHONE: process.env.SUPER_ADMIN_PHONE as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
  };
};

export const envVars = loadEnvVariables();
