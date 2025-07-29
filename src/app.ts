import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import router from "./app/routes";

// create app
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());


// Router
app.use("/api/v1", router);


// Testing API HomeRoute
const test = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome To The DigiWallet Server",
    note: "Secure Digital Payment",
  });
};

app.get("/", test);

// route error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
