/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { userServices } from "./user.service";

// create user
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData = req.body;
    const user = await userServices.createUser(userData);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Created Successfully",
      data: user,
    });
  }
);

// get user profile -> get me
const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const user = await userServices.getMyProfile(decodedToken.userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile Retrieved Successfully",
      data: user,
    });
  }
);

//  update a user
const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user as JwtPayload;
    const payload = req.body;

    // Only allow current user to update their own profile
    if (userId !== verifiedToken.userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to update this user profile"
      );
    }

    const user = await userServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Updated Successfully",
      data: user,
    });
  }
);

export const userControllers = {
  createUser,
  updateUser,
  getMyProfile,
};
