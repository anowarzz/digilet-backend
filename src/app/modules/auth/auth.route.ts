import { Router } from "express";

const router = Router();

router.post("/login", AuthControllers.pinCredentialsLogin);

export const AuthRoutes = router;
