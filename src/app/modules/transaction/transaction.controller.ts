/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { transactionServices } from "./transaction.service";

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const addMoneypayload = req.body;

  const result = await transactionServices.addMoney(
    addMoneypayload,
    user.userId
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Add Money Transaction Successful",
    data: result,
  });
});

const withdrawMoney = catchAsync(async (req: Request, res: Response) => {});
const sendMoney = catchAsync(async (req: Request, res: Response) => {});

const cashIn = catchAsync(async (req: Request, res: Response) => {});
const cashOut = catchAsync(async (req: Request, res: Response) => {});

const getTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {}
);

export const transactionControllers = {
  addMoney,
  withdrawMoney,
  sendMoney,
  cashIn,
  cashOut,
  getTransactionHistory,
};
