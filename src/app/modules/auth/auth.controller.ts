/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import jwt, { SignOptions } from "jsonwebtoken";
import passport from "passport";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// user login with credentials
const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const { pin, ...rest } = user.toObject();

      // generate JWT tokens

      const jwtPayload = {
        userId: user._id,
        phone: user.phone,
        role: user.role,
      };

      const accessToken = jwt.sign(
        jwtPayload,
        envVars.JWT_ACCESS_SECRET as string,
        { expiresIn: envVars.JWT_ACCESS_EXPIRES } as SignOptions
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
      });

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Logged In Successfully",
        data: { ...rest },
      });
    })(req, res, next);
  }
);

export const AuthControllers = {
  credentialsLogin,
};
