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
exports.getFileDownloadUrl = exports.searchFiles = exports.renameFile = exports.getFileById = exports.deleteFile = exports.deleteFilePermanently = exports.restoreFile = exports.trashFile = exports.toggleStar = exports.getStorageStats = exports.getTrashedFiles = exports.getStarredFiles = exports.getRecentFiles = exports.getSharedFiles = exports.getUserFiles = exports.uploadFile = void 0;
const File_1 = __importDefault(require("../models/File"));
const storageService = __importStar(require("./storageService"));
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const path_1 = __importDefault(require("path"));
const generateUniqueFilename = async (userId, desiredFilename) => {
    const existing = await File_1.default.findOne({
        owner: userId,
        filename: desiredFilename,
    });
    if (!existing) {
        return desiredFilename;
    }
    const ext = path_1.default.extname(desiredFilename);
    const base = path_1.default.basename(desiredFilename, ext);
    let counter = 1;
    let newFilename;
    do {
        newFilename = `${base} (${counter})${ext}`;
        const exists = await File_1.default.findOne({
            owner: userId,
            filename: newFilename,
        });
        if (!exists)
            break;
        counter++;
    } while (counter < 1000);
    return newFilename;
};
const uploadFile = async (data) => {
    const { userId, filename, originalName, buffer, size, mimeType } = data;
    storageService.validateFileSize(size);
    storageService.validateFileType(mimeType);
    const uniqueFilename = await generateUniqueFilename(userId, filename);
    const uploadResult = await storageService.uploadFile(userId, uniqueFilename, buffer, mimeType);
    const file = await File_1.default.create({
        owner: userId,
        filename: uniqueFilename,
        originalName,
        size,
        mimeType,
        storageType: uploadResult.storageType,
        path: uploadResult.path,
        s3Key: uploadResult.s3Key,
    });
    logger_1.default.info(`File created: ${file.filename} for user ${userId}`);
    return file;
};
exports.uploadFile = uploadFile;
const getUserFiles = async (userId) => {
    return File_1.default.find({ owner: userId, trashedAt: null })
        .sort({ createdAt: -1 })
        .populate("sharedWith", "name email avatar");
};
exports.getUserFiles = getUserFiles;
const getSharedFiles = async (userId) => {
    return File_1.default.find({ sharedWith: userId, trashedAt: null })
        .sort({ createdAt: -1 })
        .populate("owner", "name email avatar");
};
exports.getSharedFiles = getSharedFiles;
const getRecentFiles = async (userId, limit = 20) => {
    return File_1.default.find({ owner: userId, trashedAt: null })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .populate("sharedWith", "name email avatar");
};
exports.getRecentFiles = getRecentFiles;
const getStarredFiles = async (userId) => {
    return File_1.default.find({ owner: userId, starred: true, trashedAt: null })
        .sort({ updatedAt: -1 })
        .populate("sharedWith", "name email avatar");
};
exports.getStarredFiles = getStarredFiles;
const getTrashedFiles = async (userId) => {
    return File_1.default.find({ owner: userId, trashedAt: { $ne: null } })
        .sort({ trashedAt: -1 })
        .populate("sharedWith", "name email avatar");
};
exports.getTrashedFiles = getTrashedFiles;
const STORAGE_LIMIT_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB
const getStorageStats = async (userId) => {
    const result = await File_1.default.aggregate([
        { $match: { owner: new (require("mongoose").Types.ObjectId)(userId), trashedAt: null } },
        { $group: { _id: null, usedBytes: { $sum: "$size" }, fileCount: { $sum: 1 } } },
    ]);
    const usedBytes = result[0]?.usedBytes ?? 0;
    const fileCount = result[0]?.fileCount ?? 0;
    return { usedBytes, totalBytes: STORAGE_LIMIT_BYTES, fileCount };
};
exports.getStorageStats = getStorageStats;
const toggleStar = async (fileId, userId) => {
    const file = await File_1.default.findById(fileId);
    if (!file)
        throw new errorHandler_1.AppError("File not found", 404);
    if (file.owner.toString() !== userId)
        throw new errorHandler_1.AppError("Access denied", 403);
    file.starred = !file.starred;
    await file.save();
    logger_1.default.info(`File ${fileId} starred=${file.starred} by user ${userId}`);
    return file;
};
exports.toggleStar = toggleStar;
const trashFile = async (fileId, userId) => {
    const file = await File_1.default.findById(fileId);
    if (!file)
        throw new errorHandler_1.AppError("File not found", 404);
    if (file.owner.toString() !== userId)
        throw new errorHandler_1.AppError("Only the owner can trash this file", 403);
    file.trashedAt = new Date();
    await file.save();
    logger_1.default.info(`File trashed: ${file.filename} by user ${userId}`);
    return file;
};
exports.trashFile = trashFile;
const restoreFile = async (fileId, userId) => {
    const file = await File_1.default.findById(fileId);
    if (!file)
        throw new errorHandler_1.AppError("File not found", 404);
    if (file.owner.toString() !== userId)
        throw new errorHandler_1.AppError("Only the owner can restore this file", 403);
    file.trashedAt = null;
    await file.save();
    logger_1.default.info(`File restored: ${file.filename} by user ${userId}`);
    return file;
};
exports.restoreFile = restoreFile;
const deleteFilePermanently = async (fileId, userId) => {
    const file = await File_1.default.findById(fileId);
    if (!file)
        throw new errorHandler_1.AppError("File not found", 404);
    if (file.owner.toString() !== userId)
        throw new errorHandler_1.AppError("Only the owner can delete this file", 403);
    const pathOrKey = file.storageType === "s3" ? file.s3Key : file.path;
    await storageService.deleteFile(file.storageType, pathOrKey);
    await File_1.default.findByIdAndDelete(fileId);
    logger_1.default.info(`File permanently deleted: ${file.filename} by user ${userId}`);
};
exports.deleteFilePermanently = deleteFilePermanently;
const deleteFile = async (fileId, userId) => {
    return (0, exports.deleteFilePermanently)(fileId, userId);
};
exports.deleteFile = deleteFile;
const getFileById = async (fileId, userId) => {
    const file = await File_1.default.findById(fileId).populate("owner sharedWith", "name email avatar");
    if (!file)
        throw new errorHandler_1.AppError("File not found", 404);
    const isOwner = file.owner._id.toString() === userId;
    const isShared = file.sharedWith.some((user) => user._id.toString() === userId);
    if (!isOwner && !isShared)
        throw new errorHandler_1.AppError("Access denied", 403);
    return file;
};
exports.getFileById = getFileById;
const renameFile = async (fileId, userId, newFilename) => {
    const file = await File_1.default.findById(fileId);
    if (!file)
        throw new errorHandler_1.AppError("File not found", 404);
    if (file.owner.toString() !== userId)
        throw new errorHandler_1.AppError("Only the owner can rename this file", 403);
    const existing = await File_1.default.findOne({
        owner: userId,
        filename: newFilename,
        _id: { $ne: fileId },
    });
    if (existing)
        throw new errorHandler_1.AppError("A file with this name already exists", 409);
    file.filename = newFilename;
    await file.save();
    logger_1.default.info(`File renamed to: ${newFilename} by user ${userId}`);
    return file;
};
exports.renameFile = renameFile;
const searchFiles = async (userId, query) => {
    const regex = new RegExp(query, "i");
    return File_1.default.find({
        owner: userId,
        filename: regex,
        trashedAt: null,
    })
        .sort({ createdAt: -1 })
        .limit(50);
};
exports.searchFiles = searchFiles;
const getFileDownloadUrl = async (fileId, userId) => {
    const file = await (0, exports.getFileById)(fileId, userId);
    const pathOrKey = file.storageType === "s3" ? file.s3Key : file.path;
    return storageService.getDownloadUrl(file.storageType, pathOrKey, file.filename);
};
exports.getFileDownloadUrl = getFileDownloadUrl;
exports.default = {
    uploadFile: exports.uploadFile,
    getUserFiles: exports.getUserFiles,
    getSharedFiles: exports.getSharedFiles,
    getRecentFiles: exports.getRecentFiles,
    getStarredFiles: exports.getStarredFiles,
    getTrashedFiles: exports.getTrashedFiles,
    toggleStar: exports.toggleStar,
    trashFile: exports.trashFile,
    restoreFile: exports.restoreFile,
    deleteFilePermanently: exports.deleteFilePermanently,
    deleteFile: exports.deleteFile,
    getFileById: exports.getFileById,
    renameFile: exports.renameFile,
    searchFiles: exports.searchFiles,
    getFileDownloadUrl: exports.getFileDownloadUrl,
};
//# sourceMappingURL=fileService.js.map