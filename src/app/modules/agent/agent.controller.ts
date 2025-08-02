import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { agentServices } from "./agent.service";

// CASH_IN: agent adds money to user wallet
const cashIn = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const cashInPayload = req.body;

  const result = await agentServices.cashIn(cashInPayload, user?.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cash In Transaction Successful",
    data: result,
  });
});

// CASH_OUT: agent withdraws money from user wallet
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const cashOutPayload = req.body;

  const result = await agentServices.cashOut(cashOutPayload, user?.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cash Out Transaction Successful",
    data: result,
  });
});

export const agentControllers = {
  cashIn,
  cashOut,
};
