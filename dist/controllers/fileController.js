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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDownloadUrl = exports.getStorageStats = exports.searchFiles = exports.renameFile = exports.deleteFile = exports.getFile = exports.deleteFilePermanently = exports.restoreFile = exports.trashFile = exports.toggleStar = exports.getTrashedFiles = exports.getStarredFiles = exports.getRecentFiles = exports.getSharedFiles = exports.getFiles = exports.uploadFile = exports.upload = void 0;
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const fileService = __importStar(require("../services/fileService"));
const errorHandler_1 = require("../middlewares/errorHandler");
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
});
exports.uploadFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    if (!req.file)
        throw new errorHandler_1.AppError("No file provided", 400);
    const file = await fileService.uploadFile({
        userId: req.user.id,
        filename: req.file.originalname,
        originalName: req.file.originalname,
        buffer: req.file.buffer,
        size: req.file.size,
        mimeType: req.file.mimetype,
    });
    res.status(201).json({ success: true, data: file });
});
exports.getFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const files = await fileService.getUserFiles(req.user.id);
    res.json({ success: true, data: files });
});
exports.getSharedFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const files = await fileService.getSharedFiles(req.user.id);
    res.json({ success: true, data: files });
});
exports.getRecentFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const files = await fileService.getRecentFiles(req.user.id);
    res.json({ success: true, data: files });
});
exports.getStarredFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const files = await fileService.getStarredFiles(req.user.id);
    res.json({ success: true, data: files });
});
exports.getTrashedFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const files = await fileService.getTrashedFiles(req.user.id);
    res.json({ success: true, data: files });
});
exports.toggleStar = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const file = await fileService.toggleStar(req.params.id, req.user.id);
    res.json({ success: true, data: file });
});
exports.trashFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const file = await fileService.trashFile(req.params.id, req.user.id);
    res.json({ success: true, data: file });
});
exports.restoreFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const file = await fileService.restoreFile(req.params.id, req.user.id);
    res.json({ success: true, data: file });
});
exports.deleteFilePermanently = (0, errorHandler_1.catchAsync)(async (req, res) => {
    await fileService.deleteFilePermanently(req.params.id, req.user.id);
    res.json({ success: true, message: "File permanently deleted" });
});
exports.getFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const file = await fileService.getFileById(req.params.id, req.user.id);
    res.json({ success: true, data: file });
});
exports.deleteFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    await fileService.deleteFile(req.params.id, req.user.id);
    res.json({ success: true, message: "File deleted successfully" });
});
exports.renameFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        throw new errorHandler_1.AppError(errors.array()[0].msg, 400);
    const { filename } = req.body;
    const file = await fileService.renameFile(req.params.id, req.user.id, filename);
    res.json({ success: true, data: file });
});
exports.searchFiles = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const query = req.query.q || "";
    if (!query)
        throw new errorHandler_1.AppError("Search query is required", 400);
    const files = await fileService.searchFiles(req.user.id, query);
    res.json({ success: true, data: files });
});
exports.getStorageStats = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const stats = await fileService.getStorageStats(req.user.id);
    res.json({ success: true, data: stats });
});
exports.getDownloadUrl = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const url = await fileService.getFileDownloadUrl(req.params.id, req.user.id);
    res.json({ success: true, data: { url } });
});
//# sourceMappingURL=fileController.js.map