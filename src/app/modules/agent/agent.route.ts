import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";

import { UserRole } from "../user/user.interface";
import {
  cashInTransactionZodSchema,
  cashOutTransactionZodSchema,
} from "../wallet/wallet.validation";
import { agentControllers } from "./agent.controller";

const router = Router();

// agent actions Router
router.post(
  "/cash-in",
  validateRequest(cashInTransactionZodSchema),
  checkAuth(UserRole.AGENT),
  agentControllers.cashIn
);
router.post(
  "/cash-out",
  validateRequest(cashOutTransactionZodSchema),
  checkAuth(UserRole.AGENT),
  agentControllers.cashOut
);

export const AgentRoutes = router;
