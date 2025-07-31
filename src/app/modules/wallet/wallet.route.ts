import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { walletControllers } from "./wallet.controller";

const router = Router();


router.get("/all", checkAuth(UserRole.ADMIN), walletControllers.getAllWallets);

router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  walletControllers.getMyWallet
);

export const WalletRoutes = router;
