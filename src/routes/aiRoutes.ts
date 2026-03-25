import { Router } from "express";
import * as aiController from "../controllers/aiController";
import { authenticate } from "../middlewares/auth";

const router: Router = Router();

router.use(authenticate);

router.post("/chat", aiController.chatWithAgent);

export default router;
