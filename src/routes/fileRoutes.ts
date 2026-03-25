import { Router } from "express";
import * as fileController from "../controllers/fileController";
import { authenticate } from "../middlewares/auth";
import { validateRenameFile } from "../middlewares/validation";

const router = Router();

router.use(authenticate);

router.post(
  "/upload",
  fileController.upload.single("file"),
  fileController.uploadFile
);

router.get("/", fileController.getFiles);
router.get("/shared", fileController.getSharedFiles);
router.get("/recent", fileController.getRecentFiles);
router.get("/starred", fileController.getStarredFiles);
router.get("/trash", fileController.getTrashedFiles);
router.get("/storage", fileController.getStorageStats);
router.get("/search", fileController.searchFiles);
router.get("/:id", fileController.getFile);
router.get("/:id/download", fileController.getDownloadUrl);
router.patch("/:id/rename", validateRenameFile(), fileController.renameFile);
router.patch("/:id/star", fileController.toggleStar);
router.patch("/:id/trash", fileController.trashFile);
router.patch("/:id/restore", fileController.restoreFile);
router.delete("/:id/permanent", fileController.deleteFilePermanently);
router.delete("/:id", fileController.deleteFile);

export default router;
