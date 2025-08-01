/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
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
    const users = await adminServices.getAllUsers();

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
