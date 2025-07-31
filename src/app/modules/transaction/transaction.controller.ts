import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";

const addMoney = catchAsync(async (req: Request, res: Response) => {
    const data = req.body;
console.log(data);
res.send("Okk")

    // Your logic here...
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
