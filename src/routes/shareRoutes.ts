import { Router } from "express";
import * as shareController from "../controllers/shareController";
import { authenticate } from "../middlewares/auth";
import { validateShareFile } from "../middlewares/validation";

const router = Router();

router.use(authenticate);

router.post("/:id/share", validateShareFile(), shareController.shareFile);
router.post("/:id/unshare", validateShareFile(), shareController.unshareFile);
router.get("/:id/sharing", shareController.getFileSharing);

export default router;
