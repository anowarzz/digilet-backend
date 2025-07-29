// create a basic global error handler middleware
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../utils/sendResponse";

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Global Error Handler:", error);

  const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  const message = error.message || "Internal Server Error";

  sendResponse(res, {
    statusCode,
    success: false,
    message,
    data: null,
  });
};
