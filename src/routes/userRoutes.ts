import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/sync", userController.syncUser);

router.get("/profile", authenticate, userController.getProfile);

export default router;
