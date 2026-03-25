import { S3Client } from "@aws-sdk/client-s3";
import config from "./env";
import logger from "../utils/logger";

let s3Client: S3Client | null = null;

export const initializeS3 = (): S3Client | null => {
  const { accessKeyId, secretAccessKey, region } = config.aws;

  if (!accessKeyId || !secretAccessKey) {
    logger.info(
      "ℹ️  AWS credentials not provided. S3 storage will not be available."
    );
    logger.info("ℹ️  Using local file storage as fallback.");
    return null;
  }

  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    logger.info("✅ AWS S3 client initialized successfully");
    return s3Client;
  } catch (error) {
    logger.error("Failed to initialize S3 client:", error);
    logger.info("ℹ️  Falling back to local storage");
    return null;
  }
};

export const getS3Client = (): S3Client | null => {
  if (!s3Client) {
    return initializeS3();
  }
  return s3Client;
};

export const isS3Available = (): boolean => {
  return s3Client !== null;
};

export default { initializeS3, getS3Client, isS3Available };
