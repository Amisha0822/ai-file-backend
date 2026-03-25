import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { chat, ChatMessage } from "../services/aiService";
import { catchAsync, AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";

export const chatWithAgent = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { message, history } = req.body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      throw new AppError("Message is required", 400);
    }

    const userId = req.user!.id;

    logger.info(`AI chat from user ${userId}: "${message.substring(0, 100)}"`);

    const response = await chat(userId, message.trim(), history || []);

    res.json({
      success: true,
      data: {
        role: "assistant" as const,
        content: response,
      },
    });
  }
);
