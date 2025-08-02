// get user wallet -> my wallet

import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletServices } from "./wallet.service";

// get my wallet controller
const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await WalletServices.getMyWallet(user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Wallet retrieved",
    data: result,
  });
});

// ADD_MONEY: user adds money to their own wallet from agent wallet
const addMoney = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const addMoneypayload = req.body;

  const result = await WalletServices.addMoney(addMoneypayload, user.userId);
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

  const result = await WalletServices.withdrawMoney(
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

  const result = await WalletServices.sendMoney(sendMoneyPayload, user?.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Send Money Transaction Successful",
    data: result,
  });
});

export const walletControllers = {
  getMyWallet,
  addMoney,
  withdrawMoney,
  sendMoney,
};
