import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../user/user.interface";
import { adminControllers } from "./admin.controller";

const router = Router();


// get all users
router.get(
  "/all-users",
  checkAuth(UserRole.ADMIN),
  adminControllers.getAllUsers
);

// get singler user by id
router.get(
  "/user/:id",
  checkAuth(UserRole.ADMIN),
  adminControllers.getSingleUser
);

// delete a user
router.delete(
  "/delete-user/:id",
//   checkAuth(UserRole.ADMIN),
  adminControllers.deleteUser
);

export const AdminRoutes = router;
