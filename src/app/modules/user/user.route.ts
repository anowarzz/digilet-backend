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

// get user profile - get me
router.get(
  "/me",
  checkAuth(...Object.values(UserRole)),
  userControllers.getMyProfile
);

// update a user
router.patch(
  "/update/:id",
  checkAuth(...Object.values(UserRole)),
  userControllers.updateUser
);

// get my analytics
router.get(
  "/me/analytics",
  checkAuth(...Object.values(UserRole)),
  userControllers.getMyAnalytics
);

export const UserRoutes = router;
