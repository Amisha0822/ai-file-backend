"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileType = exports.validateFileSize = exports.getDownloadUrl = exports.deleteFile = exports.uploadFile = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = require("../config/s3");
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../middlewares/errorHandler");
const UPLOAD_DIR = path_1.default.join(__dirname, "../../uploads");
const ensureUploadDir = async (userId) => {
    const userDir = path_1.default.join(UPLOAD_DIR, userId);
    await promises_1.default.mkdir(userDir, { recursive: true });
    return userDir;
};
const getStorageType = () => {
    if (env_1.default.storage.type === "local")
        return "local";
    if (env_1.default.storage.type === "s3") {
        if (!(0, s3_1.isS3Available)()) {
            logger_1.default.warn("S3 requested but not available, falling back to local storage");
            return "local";
        }
        return "s3";
    }
    return (0, s3_1.isS3Available)() ? "s3" : "local";
};
const uploadToLocal = async (userId, filename, buffer) => {
    const userDir = await ensureUploadDir(userId);
    const filePath = path_1.default.join(userDir, filename);
    await promises_1.default.writeFile(filePath, buffer);
    logger_1.default.info(`File uploaded to local storage: ${filePath}`);
    return {
        storageType: "local",
        path: filePath,
    };
};
const uploadToS3 = async (userId, filename, buffer, mimeType) => {
    const s3Client = (0, s3_1.getS3Client)();
    if (!s3Client) {
        throw new errorHandler_1.AppError("S3 is not configured", 500);
    }
    const s3Key = `${userId}/${filename}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: env_1.default.aws.s3Bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
    });
    await s3Client.send(command);
    logger_1.default.info(`File uploaded to S3: ${s3Key}`);
    return {
        storageType: "s3",
        s3Key,
    };
};
const uploadFile = async (userId, filename, buffer, mimeType) => {
    const storageType = getStorageType();
    if (storageType === "s3") {
        return uploadToS3(userId, filename, buffer, mimeType);
    }
    else {
        return uploadToLocal(userId, filename, buffer);
    }
};
exports.uploadFile = uploadFile;
const deleteFromLocal = async (filePath) => {
    try {
        await promises_1.default.unlink(filePath);
        logger_1.default.info(`File deleted from local storage: ${filePath}`);
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
        logger_1.default.warn(`File not found in local storage: ${filePath}`);
    }
};
const deleteFromS3 = async (s3Key) => {
    const s3Client = (0, s3_1.getS3Client)();
    if (!s3Client) {
        throw new errorHandler_1.AppError("S3 is not configured", 500);
    }
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: env_1.default.aws.s3Bucket,
        Key: s3Key,
    });
    await s3Client.send(command);
    logger_1.default.info(`File deleted from S3: ${s3Key}`);
};
const deleteFile = async (storageType, pathOrKey) => {
    if (storageType === "s3") {
        await deleteFromS3(pathOrKey);
    }
    else {
        await deleteFromLocal(pathOrKey);
    }
};
exports.deleteFile = deleteFile;
const getDownloadUrl = async (storageType, pathOrKey, filename) => {
    if (storageType === "s3") {
        const s3Client = (0, s3_1.getS3Client)();
        if (!s3Client) {
            throw new errorHandler_1.AppError("S3 is not configured", 500);
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: env_1.default.aws.s3Bucket,
            Key: pathOrKey,
            ResponseContentDisposition: `attachment; filename="${filename}"`,
        });
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        return url;
    }
    else {
        return `/api/files/download/${path_1.default.basename(pathOrKey)}`;
    }
};
exports.getDownloadUrl = getDownloadUrl;
const validateFileSize = (size) => {
    if (size > env_1.default.storage.maxFileSize) {
        throw new errorHandler_1.AppError(`File size exceeds maximum allowed size of ${env_1.default.storage.maxFileSize / 1024 / 1024}MB`, 400);
    }
};
exports.validateFileSize = validateFileSize;
const validateFileType = (mimeType) => {
    if (!mimeType) {
        throw new errorHandler_1.AppError("File type is required", 400);
    }
};
exports.validateFileType = validateFileType;
exports.default = {
    uploadFile: exports.uploadFile,
    deleteFile: exports.deleteFile,
    getDownloadUrl: exports.getDownloadUrl,
    validateFileSize: exports.validateFileSize,
    validateFileType: exports.validateFileType,
};
//# sourceMappingURL=storageService.js.map