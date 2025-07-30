import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { UserRole } from "../modules/user/user.interface";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    throw new AppError(httpStatus.FORBIDDEN, "No Access Token Found");
  }

  const verifiedToken = jwt.verify(accessToken, envVars.JWT_ACCESS_SECRET);

  if (!verifiedToken) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized",
      verifiedToken
    );
  }

  console.log("token", verifiedToken);
  

  if ((verifiedToken as JwtPayload).role !== UserRole.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not permitted to perform this action"
    );
  }

  next();
};
