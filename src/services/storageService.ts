import fs from "fs/promises";
import path from "path";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, isS3Available } from "../config/s3";
import config from "../config/env";
import logger from "../utils/logger";
import { AppError } from "../middlewares/errorHandler";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

export interface UploadResult {
  storageType: "local" | "s3";
  path?: string;
  s3Key?: string;
  url?: string;
}

const ensureUploadDir = async (userId: string): Promise<string> => {
  const userDir = path.join(UPLOAD_DIR, userId);
  await fs.mkdir(userDir, { recursive: true });
  return userDir;
};

const getStorageType = (): "local" | "s3" => {
  if (config.storage.type === "local") return "local";

  if (config.storage.type === "s3") {
    if (!isS3Available()) {
      logger.warn(
        "S3 requested but not available, falling back to local storage"
      );
      return "local";
    }

    return "s3";
  }
  return isS3Available() ? "s3" : "local";
};

const uploadToLocal = async (
  userId: string,
  filename: string,
  buffer: Buffer
): Promise<UploadResult> => {
  const userDir = await ensureUploadDir(userId);
  const filePath = path.join(userDir, filename);

  await fs.writeFile(filePath, buffer);

  logger.info(`File uploaded to local storage: ${filePath}`);

  return {
    storageType: "local",
    path: filePath,
  };
};

const uploadToS3 = async (
  userId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<UploadResult> => {
  const s3Client = getS3Client();

  if (!s3Client) {
    throw new AppError("S3 is not configured", 500);
  }

  const s3Key = `${userId}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: s3Key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  logger.info(`File uploaded to S3: ${s3Key}`);

  return {
    storageType: "s3",
    s3Key,
  };
};

export const uploadFile = async (
  userId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<UploadResult> => {
  const storageType = getStorageType();

  if (storageType === "s3") {
    return uploadToS3(userId, filename, buffer, mimeType);
  } else {
    return uploadToLocal(userId, filename, buffer);
  }
};

const deleteFromLocal = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath);
    logger.info(`File deleted from local storage: ${filePath}`);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    logger.warn(`File not found in local storage: ${filePath}`);
  }
};

const deleteFromS3 = async (s3Key: string): Promise<void> => {
  const s3Client = getS3Client();

  if (!s3Client) {
    throw new AppError("S3 is not configured", 500);
  }

  const command = new DeleteObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: s3Key,
  });

  await s3Client.send(command);
  logger.info(`File deleted from S3: ${s3Key}`);
};

export const deleteFile = async (
  storageType: "local" | "s3",
  pathOrKey: string
): Promise<void> => {
  if (storageType === "s3") {
    await deleteFromS3(pathOrKey);
  } else {
    await deleteFromLocal(pathOrKey);
  }
};

export const getDownloadUrl = async (
  storageType: "local" | "s3",
  pathOrKey: string,
  filename: string
): Promise<string> => {
  if (storageType === "s3") {
    const s3Client = getS3Client();

    if (!s3Client) {
      throw new AppError("S3 is not configured", 500);
    }

    const command = new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: pathOrKey,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return url;
  } else {
    return `/api/files/download/${path.basename(pathOrKey)}`;
  }
};

export const validateFileSize = (size: number): void => {
  if (size > config.storage.maxFileSize) {
    throw new AppError(
      `File size exceeds maximum allowed size of ${
        config.storage.maxFileSize / 1024 / 1024
      }MB`,
      400
    );
  }
};

export const validateFileType = (mimeType: string): void => {
  if (!mimeType) {
    throw new AppError("File type is required", 400);
  }
};

export default {
  uploadFile,
  deleteFile,
  getDownloadUrl,
  validateFileSize,
  validateFileType,
};
