import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userControllers } from "./user.controller";
import { UserRole } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router();

// create a user
router.post(
  "/register",
  validateRequest(createUserZodSchema),
  userControllers.createUser
);

// get user profile - get me
router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  userControllers.getMyProfile
);

// get single user
router.get(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  userControllers.getSingleUser
);

// update a user
router.patch(
  "/:id",
  checkAuth(...Object.values(UserRole)),
  validateRequest(updateUserZodSchema),
  userControllers.updateUser
);

export const UserRoutes = router;
