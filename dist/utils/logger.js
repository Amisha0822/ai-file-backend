"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const env_1 = __importDefault(require("../config/env"));
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
    if (stack) {
        return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level}]: ${message}`;
});
const logger = winston_1.default.createLogger({
    level: env_1.default.nodeEnv === "production" ? "info" : "debug",
    format: combine(errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
});
if (env_1.default.nodeEnv === "production") {
    logger.add(new winston_1.default.transports.File({
        filename: "logs/error.log",
        level: "error",
    }));
    logger.add(new winston_1.default.transports.File({
        filename: "logs/combined.log",
    }));
}
exports.default = logger;
//# sourceMappingURL=logger.js.map