import File, { IFile } from "../models/File";
import * as userService from "./userService";
import { AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";

export const shareFile = async (
  fileId: string,
  ownerId: string,
  recipientEmail: string
): Promise<IFile> => {
  const file = await File.findById(fileId);

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (file.owner.toString() !== ownerId) {
    throw new AppError("Only the owner can share this file", 403);
  }

  const recipient = await userService.findUserByEmail(recipientEmail);

  if (!recipient) {
    throw new AppError("User not found with that email", 404);
  }

  if (recipient._id.toString() === ownerId) {
    throw new AppError("Cannot share file with yourself", 400);
  }

  const alreadyShared = file.sharedWith.some(
    (userId) => userId.toString() === recipient._id.toString()
  );

  if (alreadyShared) {
    throw new AppError("File is already shared with this user", 400);
  }

  file.sharedWith.push(recipient._id);
  await file.save();

  logger.info(
    `File ${file.filename} shared with ${recipientEmail} by user ${ownerId}`
  );

  return file.populate("sharedWith", "name email avatar");
};

export const unshareFile = async (
  fileId: string,
  ownerId: string,
  recipientEmail: string
): Promise<IFile> => {
  const file = await File.findById(fileId);

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (file.owner.toString() !== ownerId) {
    throw new AppError("Only the owner can unshare this file", 403);
  }

  const recipient = await userService.findUserByEmail(recipientEmail);

  if (!recipient) {
    throw new AppError("User not found with that email", 404);
  }

  file.sharedWith = file.sharedWith.filter(
    (userId) => userId.toString() !== recipient._id.toString()
  );

  await file.save();

  logger.info(
    `File ${file.filename} unshared with ${recipientEmail} by user ${ownerId}`
  );

  return file.populate("sharedWith", "name email avatar");
};

export const getFileSharing = async (
  fileId: string,
  userId: string
): Promise<any[]> => {
  const file = await File.findById(fileId).populate(
    "sharedWith",
    "name email avatar"
  );

  if (!file) {
    throw new AppError("File not found", 404);
  }

  if (file.owner.toString() !== userId) {
    throw new AppError("Only the owner can view sharing information", 403);
  }

  return file.sharedWith as any[];
};

export default {
  shareFile,
  unshareFile,
  getFileSharing,
};
