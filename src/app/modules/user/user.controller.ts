import { userServices } from './user.service';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";


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


// get all users
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userServices.getAllUsers();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users Retrieved Successfully",
      meta: users.meta,
      data: users.data,
    });
  }
);

export const userControllers = {
  createUser,
  getAllUsers,
};
