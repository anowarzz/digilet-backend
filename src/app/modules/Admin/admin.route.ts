import { Router } from "express";
import { adminControllers } from "./admin.controller";

const router = Router();

router.get("/all-users", adminControllers.getAllUsers);
router.delete("/delete-user/:id", adminControllers.deleteUser);

export const AdminRoutes = router;
