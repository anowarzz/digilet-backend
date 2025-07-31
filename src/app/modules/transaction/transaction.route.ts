import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { transactionControllers } from "./transaction.controller";
import {
  addMoneyTransactionZodSchema,
  cashInTransactionZodSchema,
  cashOutTransactionZodSchema,
  sendMoneyTransactionZodSchema,
  withdrawTransactionZodSchema,
} from "./transaction.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";

const router = Router();

//  user actions route
router.post(
  "/add-money",
  validateRequest(addMoneyTransactionZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  transactionControllers.addMoney
);

router.post(
  "/withdraw",
  validateRequest(withdrawTransactionZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  transactionControllers.withdrawMoney
);
router.post(
  "/send-money",
  validateRequest(sendMoneyTransactionZodSchema),
  transactionControllers.sendMoney
);

// agent actions Router
router.post(
  "/cash-in",
  validateRequest(cashInTransactionZodSchema),
  transactionControllers.cashIn
);
router.post(
  "/cash-out",
  validateRequest(cashOutTransactionZodSchema),
  transactionControllers.cashOut
);

// transaction history
router.get("/history", transactionControllers.getTransactionHistory);

export const TransactionRoutes = router;
