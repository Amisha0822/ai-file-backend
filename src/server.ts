import app from "./app";
import config from "./config/env";
import connectDatabase from "./config/database";
import { initializeS3 } from "./config/s3";
import logger from "./utils/logger";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    initializeS3();

    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📦 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
