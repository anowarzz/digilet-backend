import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { UserStatus } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken =  req.cookies.accessToken || req.headers.authorization;

      if (!accessToken) {
        throw new AppError(403, "No Access Token Found");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      //  check if user exist with this email
      const isUserExist = await User.findOne({
        phone: verifiedToken.phone,
      });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "No Logged In User Found");
      }

      // user status check
      if (
        isUserExist.status === UserStatus.BLOCKED ||
        isUserExist.status === UserStatus.SUSPENDED
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          `This user is ${isUserExist.status}. cannot proceed with the request`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "This user account is Deleted"
        );
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          `Unauthorized access. Only ${authRoles.join(
            ", "
          )} can access this route`
        );
      }

      req.user = verifiedToken;

      next();
    } catch (error) {
      next(error);
    }
  };
