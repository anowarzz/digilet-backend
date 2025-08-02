import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { transactionControllers } from "./transaction.controller";

const router = Router();

// transaction history
router.get(
  "/me/history",
  checkAuth(UserRole.USER, UserRole.AGENT),
  transactionControllers.getTransactionHistory
);

export const TransactionRoutes = router;
