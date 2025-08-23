import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import passport from "passport";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import router from "./app/routes";

// create app
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
  })
);

// Router
app.use("/api/v1", router);

// Testing API HomeRoute
const test = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome To The Digilet Server",
    note: "Secure Digital Wallet",
  });
};

app.get("/", test);

// Global error handler
app.use(globalErrorHandler);

// not found route handler
app.use(notFound);

export default app;
