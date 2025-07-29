/* eslint-disable @typescript-eslint/no-unused-vars */
// create a user

import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userServices } from "./user.service";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userData = req.body;

    const user = await userServices.createUser(userData);

    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

export const userControllers = {
  createUser,
};
