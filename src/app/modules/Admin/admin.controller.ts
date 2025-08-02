/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserRole, UserStatus } from "../user/user.interface";
import { adminServices } from "./admin.service";

// create admin
const createAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminData = req.body;
    const newAdmin = await adminServices.createAdmin(adminData);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Admin Created Successfully",
      data: newAdmin,
    });
  }
);

// get all users
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, status } = req.query;

    // Build filters object
    const filters: { role?: UserRole; status?: UserStatus } = {};

    // Validate and set role filter
    if (role && typeof role === "string") {
      const upperRole = role.toUpperCase();
      if (!Object.values(UserRole).includes(upperRole as UserRole)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid role: ${role}. Valid roles are: ${Object.values(
            UserRole
          ).join(", ")}`
        );
      }
      filters.role = upperRole as UserRole;
    }

    // Validate and set status filter
    if (status && typeof status === "string") {
      const upperStatus = status.toUpperCase();
      if (!Object.values(UserStatus).includes(upperStatus as UserStatus)) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Invalid status: ${status}. Valid statuses are: ${Object.values(
            UserStatus
          ).join(", ")}`
        );
      }
      filters.status = upperStatus as UserStatus;
    }

    const users = await adminServices.getAllUsers(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users Retrieved Successfully",
      meta: users.meta,
      data: users.data,
    });
  }
);

// -----------------------------------

// get single user
const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await adminServices.getSingleUser(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Retrieved Successfully",
      data: user,
    });
  }
);

// -----------------------------------
// update a user profile
const updateUserProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const userData = req.body;

    const updatedUser = await adminServices.updateUserProfile(userId, userData);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Profile Updated Successfully",
      data: updatedUser,
    });
  }
);

// -----------------------------------

// delete a user
const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;

    const deletedUser = await adminServices.deleteUser(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Deleted Successfully",
      data: deletedUser,
    });
  }
);

// -----------------------------------
// get all wallets
const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const wallets = await adminServices.getAllWallets();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All wallets retrieved",
    data: wallets,
  });
});

// -----------------------------------
// get single wallet
const getSingleWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const walletId = req.params.walletId;
    const wallet = await adminServices.getSingleWallet(walletId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Wallet Retrieved Successfully",
      data: wallet,
    });
  }
);

// -----------------------------------
// Add balance to wallet
const addBalanceToWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const { amount, description } = req.body;
    const adminUser = req.user as JwtPayload;
    const adminUserId = adminUser.userId;

    const result = await adminServices.addBalanceToWallet(
      userId,
      { amount, description: description || "Balance added by admin" },
      adminUserId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Balance Added Successfully",
      data: result,
    });
  }
);

// -----------------------------------
// block user wallet
const blockUserWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const blockedWallet = await adminServices.blockUserWallet(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Wallet Blocked Successfully",
      data: blockedWallet,
    });
  }
);

// -----------------------------------
// unblock user wallet
const unblockUserWallet = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const unblockedWallet = await adminServices.unblockUserWallet(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Wallet Unblocked Successfully",
      data: unblockedWallet,
    });
  }
);

// -----------------------------------
// approve agent
const approveAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.agentId;

    const approvedAgent = await adminServices.approveAgent(agentId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent Approved Successfully",
      data: approvedAgent,
    });
  }
);

// ---------------------------------
// suspend agent

const suspendAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.agentId;

    const suspendedAgent = await adminServices.suspendAgent(agentId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent Suspended Successfully",
      data: suspendedAgent,
    });
  }
);

// -----------------------------------
// Get all transactions for admin
const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllTransactions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Transactions Retrieved Successfully",
    data: result,
  });
});

export const adminControllers = {
  createAdmin,
  getAllUsers,
  addBalanceToWallet,
  getSingleUser,
  deleteUser,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  suspendAgent,
  getAllTransactions,
  updateUserProfile,
  getAllWallets,
  getSingleWallet,
};
