import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { transactionControllers } from "./transaction.controller";
import {
  addMoneyTransactionZodSchema,
  sendMoneyTransactionZodSchema,
  withdrawTransactionZodSchema,
} from "./transaction.validation";

const router = Router();

//  user, agent actions route
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
  checkAuth(UserRole.USER, UserRole.AGENT),
  transactionControllers.sendMoney
);

// transaction history
router.get(
  "/history",
  checkAuth(UserRole.USER, UserRole.AGENT),
  transactionControllers.getTransactionHistory
);

export const TransactionRoutes = router;
