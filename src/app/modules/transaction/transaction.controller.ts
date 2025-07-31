/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { transactionServices } from "./transaction.service";

// ADD_MONEY: user adds money to their own wallet from agent wallet
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

// WITHDRAW: user withdraws money to agent wallet
const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const withdrawPayload = req.body;

  const result = await transactionServices.withdrawMoney(
    withdrawPayload,
    user.userId
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Withdraw Money Transaction Successful",
    data: result,
  });
});

// SEND_MONEY: user sends money to another user
const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;


  const sendMoneyPayload = req.body;

  const result = await transactionServices.sendMoney(
    sendMoneyPayload,
    user?.userId
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Send Money Transaction Successful",
    data: result,
  });
});

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
