"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = __importDefault(require("./config/env"));
const database_1 = __importDefault(require("./config/database"));
const s3_1 = require("./config/s3");
const logger_1 = __importDefault(require("./utils/logger"));
const startServer = async () => {
    try {
        await (0, database_1.default)();
        (0, s3_1.initializeS3)();
        app_1.default.listen(env_1.default.port, () => {
            logger_1.default.info(`🚀 Server running on port ${env_1.default.port}`);
            logger_1.default.info(`📦 Environment: ${env_1.default.nodeEnv}`);
            logger_1.default.info(`🌐 Frontend URL: ${env_1.default.frontendUrl}`);
        });
    }
    catch (error) {
        logger_1.default.error("Failed to start server:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map