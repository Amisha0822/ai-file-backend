"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isS3Available = exports.getS3Client = exports.initializeS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("../utils/logger"));
let s3Client = null;
const initializeS3 = () => {
    const { accessKeyId, secretAccessKey, region } = env_1.default.aws;
    if (!accessKeyId || !secretAccessKey) {
        logger_1.default.info("ℹ️  AWS credentials not provided. S3 storage will not be available.");
        logger_1.default.info("ℹ️  Using local file storage as fallback.");
        return null;
    }
    try {
        s3Client = new client_s3_1.S3Client({
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        logger_1.default.info("✅ AWS S3 client initialized successfully");
        return s3Client;
    }
    catch (error) {
        logger_1.default.error("Failed to initialize S3 client:", error);
        logger_1.default.info("ℹ️  Falling back to local storage");
        return null;
    }
};
exports.initializeS3 = initializeS3;
const getS3Client = () => {
    if (!s3Client) {
        return (0, exports.initializeS3)();
    }
    return s3Client;
};
exports.getS3Client = getS3Client;
const isS3Available = () => {
    return s3Client !== null;
};
exports.isS3Available = isS3Available;
exports.default = { initializeS3: exports.initializeS3, getS3Client: exports.getS3Client, isS3Available: exports.isS3Available };
//# sourceMappingURL=s3.js.map