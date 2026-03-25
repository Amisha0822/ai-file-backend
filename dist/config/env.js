"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/google-drive-clone",
    jwtSecret: process.env.JWT_SECRET || "Harsh@7877",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    groqApiKey: process.env.GROQ_API_KEY || "",
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || "us-east-1",
        s3Bucket: process.env.AWS_S3_BUCKET,
    },
    storage: {
        type: process.env.STORAGE_TYPE || "auto",
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "104857600", 10),
    },
};
if (!config.jwtSecret || config.jwtSecret === "Harsh@7877") {
    console.warn("⚠️  Warning: Using default JWT_SECRET. Please set a secure secret in production!");
}
exports.default = config;
//# sourceMappingURL=env.js.map