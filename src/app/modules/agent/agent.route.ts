import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  cashInTransactionZodSchema,
  cashOutTransactionZodSchema,
} from "../transaction/transaction.validation";
import { UserRole } from "../user/user.interface";
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
