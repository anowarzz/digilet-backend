/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

//  connect with database
const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL as string);

    console.log("Connected to MongoDB");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

//  start server
(async () => {
  await startServer();
  await seedSuperAdmin()
})();

// Unhandled rejection handling
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected, Shutting down the server...");
  console.log("Error details:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});


// Uncaught exception handling
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception detected, Shutting down the server...");
  console.log("Error details:", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// signal shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received, Shutting down the server...");
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  }
  process.exit(0);
});

// signal shutdown handling for SIGINT
process.on("SIGINT", () => {
  console.log("SIGINT signal received, Shutting down the server...");
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  }
  process.exit(0);
});
