"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const logger_1 = __importDefault(require("../utils/logger"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Authorization token required" });
            return;
        }
        const token = authHeader.substring(7);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.default.jwtSecret);
            const userPayload = {
                id: decoded.sub || decoded.id,
                email: decoded.email,
                name: decoded.name,
                googleId: decoded.googleId || decoded.sub,
            };
            req.user = userPayload;
            next();
        }
        catch (jwtError) {
            logger_1.default.warn("Invalid JWT token:", jwtError);
            res.status(401).json({ error: "Invalid or expired token" });
            return;
        }
    }
    catch (error) {
        logger_1.default.error("Authentication error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.authenticate = authenticate;
exports.default = exports.authenticate;
//# sourceMappingURL=auth.js.map