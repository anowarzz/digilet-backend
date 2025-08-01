// get user wallet -> my wallet

import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";

// get my wallet controller
const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await WalletService.getMyWallet(user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Wallet retrieved",
    data: result,
  });
});

export const walletControllers = {
  getMyWallet,
};
