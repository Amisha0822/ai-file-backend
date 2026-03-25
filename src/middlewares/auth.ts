import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env";
import { AuthenticatedRequest, UserPayload } from "../types";
import logger from "../utils/logger";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authorization token required" });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;

      const userPayload: UserPayload = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
        googleId: decoded.googleId || decoded.sub,
      };

      req.user = userPayload;

      next();
    } catch (jwtError) {
      logger.warn("Invalid JWT token:", jwtError);
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default authenticate;
