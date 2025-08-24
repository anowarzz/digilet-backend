import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";

import { UserRole } from "../user/user.interface";
import { walletControllers } from "./wallet.controller";
import {
  addMoneyTransactionZodSchema,
  sendMoneyTransactionZodSchema,
  withdrawTransactionZodSchema,
} from "./wallet.validation";

const router = Router();

// get current user wallet
router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  walletControllers.getMyWallet
);

//  user, agent actions to manage wallet    //

// ADD MONEY TO WALLET
router.post(
  "/add-money",
  validateRequest(addMoneyTransactionZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  walletControllers.addMoney
);

// WITHDRAW MONEY FROM WALLET
router.post(
  "/withdraw-money",
  validateRequest(withdrawTransactionZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  walletControllers.withdrawMoney
);

// SEND MONEY TO ANOTHER USER
router.post(
  "/send-money",
  validateRequest(sendMoneyTransactionZodSchema),
  checkAuth(UserRole.USER, UserRole.AGENT),
  walletControllers.sendMoney
);

export const WalletRoutes = router;
