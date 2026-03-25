"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = __importDefault(require("./env"));
const logger_1 = __importDefault(require("../utils/logger"));
const connectDatabase = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };
        await mongoose_1.default.connect(env_1.default.mongodbUri, options);
        logger_1.default.info("✅ MongoDB connected successfully");
        mongoose_1.default.connection.on("error", (err) => {
            logger_1.default.error("MongoDB connection error:", err);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            logger_1.default.warn("MongoDB disconnected");
        });
        process.on("SIGINT", async () => {
            await mongoose_1.default.connection.close();
            logger_1.default.info("MongoDB connection closed due to app termination");
            process.exit(0);
        });
    }
    catch (error) {
        logger_1.default.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
exports.default = exports.connectDatabase;
//# sourceMappingURL=database.js.map