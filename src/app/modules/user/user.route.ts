import { Router } from "express";
import { userControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";

const router = Router();

// create a user
router.post("/register", validateRequest(createUserZodSchema), userControllers.createUser);

// get all users 
router.get("/all-users", userControllers.getAllUsers);

export const UserRoutes = router;
