import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { transactionServices } from "./transaction.service";

/*/  Get transaction history for user and agent  /*/
const getTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const query = req.query as Record<string, string>;

    const result = await transactionServices.getTransactionHistory(
      user?.userId,
      query
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Transaction History Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const transactionControllers = {
  getTransactionHistory,
};
