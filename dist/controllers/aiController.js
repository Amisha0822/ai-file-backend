"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAgent = void 0;
const aiService_1 = require("../services/aiService");
const errorHandler_1 = require("../middlewares/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
exports.chatWithAgent = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { message, history } = req.body;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
        throw new errorHandler_1.AppError("Message is required", 400);
    }
    const userId = req.user.id;
    logger_1.default.info(`AI chat from user ${userId}: "${message.substring(0, 100)}"`);
    const response = await (0, aiService_1.chat)(userId, message.trim(), history || []);
    res.json({
        success: true,
        data: {
            role: "assistant",
            content: response,
        },
    });
});
//# sourceMappingURL=aiController.js.map