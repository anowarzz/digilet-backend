import { Router } from "express";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);

export const AuthRoutes = router;
