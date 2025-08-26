import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserRole } from "../user/user.interface";
import { createUserZodSchema } from "../user/user.validation";
import { addBalanceZodSchema } from "../wallet/wallet.validation";
import { adminControllers } from "./admin.controller";

const router = Router();

// create admin
router.post(
  "/create-admin",
  validateRequest(createUserZodSchema),
  checkAuth(UserRole.ADMIN),
  adminControllers.createAdmin
);

// get all users and agents
router.get(
  "/all/users-and-agents",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllUsersAndAgents
);
// get all users
router.get(
  "/all-users",
  checkAuth(UserRole.ADMIN, UserRole.USER, UserRole.AGENT),
  adminControllers.getAllUsers
);
// get all agents
router.get(
  "/all-agents",
  checkAuth(UserRole.ADMIN, UserRole.AGENT, UserRole.USER),
  adminControllers.getAllAgents
);

// get all transactions
router.get(
  "/all-transactions",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllTransactions
);

// get all transactions of a specific user
router.get(
  "/transactions/user/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.getUserTransactions
);

// get all wallets
router.get(
  "/wallets/all",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllWallets
);

// add balance to a wallet
router.patch(
  "/wallets/add-balance/:id",
  validateRequest(addBalanceZodSchema),
  checkAuth(UserRole.ADMIN),
  adminControllers.addBalanceToWallet
);

// get single user by id
router.get(
  "/users/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.getSingleUser
);

// update any user profile
router.patch(
  "/users/update/:userId",
  checkAuth(UserRole.ADMIN),
  adminControllers.updateUserProfile
);

// get single wallet
router.get(
  "/wallets/:walletId",
  checkAuth(UserRole.ADMIN),
  adminControllers.getSingleWallet
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

// reject agent
router.patch(
  "/agents/reject/:agentId",
  checkAuth(UserRole.ADMIN),
  adminControllers.rejectAgent
);

// suspend agent
router.patch(
  "/agents/suspend/:agentId",
  checkAuth(UserRole.ADMIN),
  adminControllers.suspendAgent
);

export const AdminRoutes = router;
