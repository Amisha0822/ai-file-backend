"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fileController = __importStar(require("../controllers/fileController"));
const auth_1 = require("../middlewares/auth");
const validation_1 = require("../middlewares/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post("/upload", fileController.upload.single("file"), fileController.uploadFile);
router.get("/", fileController.getFiles);
router.get("/shared", fileController.getSharedFiles);
router.get("/recent", fileController.getRecentFiles);
router.get("/starred", fileController.getStarredFiles);
router.get("/trash", fileController.getTrashedFiles);
router.get("/storage", fileController.getStorageStats);
router.get("/search", fileController.searchFiles);
router.get("/:id", fileController.getFile);
router.get("/:id/download", fileController.getDownloadUrl);
router.patch("/:id/rename", (0, validation_1.validateRenameFile)(), fileController.renameFile);
router.patch("/:id/star", fileController.toggleStar);
router.patch("/:id/trash", fileController.trashFile);
router.patch("/:id/restore", fileController.restoreFile);
router.delete("/:id/permanent", fileController.deleteFilePermanently);
router.delete("/:id", fileController.deleteFile);
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map