import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";
import { UserRole } from "./user.interface";
import { createUserZodSchema } from "./user.validation";

const router = Router();

// create a user
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userControllers.createUser
);

// get all users
router.get(
  "/all-users",
  checkAuth(UserRole.ADMIN),
  userControllers.getAllUsers
);

// get single user
router.get("/:id", userControllers.getSingleUser);

export const UserRoutes = router;
