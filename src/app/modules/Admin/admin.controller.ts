/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.service";

// User Analytics
const getUserAnalytics = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const result = await adminServices.getUserAnalytics(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Analytics Retrieved Successfully",
    data: result,
  });
});

// Agent Analytics
const getAgentAnalytics = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.agentId;
  const result = await adminServices.getAgentAnalytics(agentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent Analytics Retrieved Successfully",
    data: result,
  });
});

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

// -----------------------------------
// get all users and agents
const getAllUsersAndAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;

    const result = await adminServices.getAllUsersAndAgents(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users & Agents Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
// -----------------------------------
// get all users
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;

    const result = await adminServices.getAllUsers(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);
// -----------------------------------
// get all  agents
const getAllAgents = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;

    const result = await adminServices.getAllAgents(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agents Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// -----------------------------------
// get single user
const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
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

    if (userData === undefined) {
      throw new AppError(httpStatus.BAD_REQUEST, "User data is required");
    }

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
    const userId = req.params.userId;

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
  const result = await adminServices.getAllWallets(
    req.query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All wallets retrieved successfully",
    meta: result.meta,
    data: result.data,
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
// -----------------------------------
// reject agent
const rejectAgent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.agentId;

    const rejectedAgent = await adminServices.rejectAgent(agentId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent Rejected Successfully",
      data: rejectedAgent,
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
  const query = req.query as Record<string, string>;
  const result = await adminServices.getAllTransactions(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Transactions Retrieved Successfully",
    meta: result.meta,
    data: result.data,
  });
});

// -----------------------------------
// Get all transactions of a specific user
const getUserTransactions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const query = req.query as Record<string, string>;

    const result = await adminServices.getUserTransactions(userId, query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Transactions Retrieved Successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// Analytics Overview
const getAnalyticsOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAnalyticsOverview();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Analytics Overview Retrieved Successfully",
    data: result,
  });
});

export const adminControllers = {
  createAdmin,
  getAllUsers,
  getAllAgents,
  getAllUsersAndAgents,
  addBalanceToWallet,
  getSingleUser,
  deleteUser,
  blockUserWallet,
  unblockUserWallet,
  approveAgent,
  rejectAgent,
  suspendAgent,
  getAllTransactions,
  getUserTransactions,
  updateUserProfile,
  getAllWallets,
  getSingleWallet,
  getAnalyticsOverview,
  getUserAnalytics,
  getAgentAnalytics,
};
