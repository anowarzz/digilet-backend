import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { adminControllers } from "./admin.controller";

const router = Router();

// get all users
router.get(
  "/users/all",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllUsers
);

// get all transactions
router.get(
  "/transactions/all",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllTransactions
);

// get all wallets
router.get(
  "/wallets/all",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllWallets
);



// get single user by id
router.get(
  "/users/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.getSingleUser
);

// delete a user
router.delete(
  "/users/delete/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.deleteUser
);

// block user wallet
router.patch(
  "/users/block/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.blockUserWallet
);

// unblock user wallet
router.patch(
  "/users/unblock/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.unblockUserWallet
);

// approve agent
router.patch(
  "/agents/approve/:agentId",
  checkAuth(UserRole.ADMIN),
  adminControllers.approveAgent
);

// suspend agent
router.patch(
  "/agents/suspend/:agentId",
  checkAuth(UserRole.ADMIN),
  adminControllers.suspendAgent
);

export const AdminRoutes = router;
