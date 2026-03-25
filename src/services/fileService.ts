import File, { IFile } from "../models/File";
import * as storageService from "./storageService";
import { AppError } from "../middlewares/errorHandler";
import logger from "../utils/logger";
import path from "path";

export interface CreateFileData {
  userId: string;
  filename: string;
  originalName: string;
  buffer: Buffer;
  size: number;
  mimeType: string;
}

const generateUniqueFilename = async (
  userId: string,
  desiredFilename: string
): Promise<string> => {
  const existing = await File.findOne({
    owner: userId,
    filename: desiredFilename,
  });

  if (!existing) {
    return desiredFilename;
  }

  const ext = path.extname(desiredFilename);
  const base = path.basename(desiredFilename, ext);
  let counter = 1;
  let newFilename: string;

  do {
    newFilename = `${base} (${counter})${ext}`;
    const exists = await File.findOne({
      owner: userId,
      filename: newFilename,
    });
    if (!exists) break;
    counter++;
  } while (counter < 1000);

  return newFilename;
};

export const uploadFile = async (data: CreateFileData): Promise<IFile> => {
  const { userId, filename, originalName, buffer, size, mimeType } = data;

  storageService.validateFileSize(size);
  storageService.validateFileType(mimeType);

  const uniqueFilename = await generateUniqueFilename(userId, filename);

  const uploadResult = await storageService.uploadFile(
    userId,
    uniqueFilename,
    buffer,
    mimeType
  );

  const file = await File.create({
    owner: userId,
    filename: uniqueFilename,
    originalName,
    size,
    mimeType,
    storageType: uploadResult.storageType,
    path: uploadResult.path,
    s3Key: uploadResult.s3Key,
  });

  logger.info(`File created: ${file.filename} for user ${userId}`);

  return file;
};

export const getUserFiles = async (userId: string): Promise<IFile[]> => {
  return File.find({ owner: userId, trashedAt: null })
    .sort({ createdAt: -1 })
    .populate("sharedWith", "name email avatar");
};

export const getSharedFiles = async (userId: string): Promise<IFile[]> => {
  return File.find({ sharedWith: userId, trashedAt: null })
    .sort({ createdAt: -1 })
    .populate("owner", "name email avatar");
};

export const getRecentFiles = async (
  userId: string,
  limit = 20
): Promise<IFile[]> => {
  return File.find({ owner: userId, trashedAt: null })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("sharedWith", "name email avatar");
};

export const getStarredFiles = async (userId: string): Promise<IFile[]> => {
  return File.find({ owner: userId, starred: true, trashedAt: null })
    .sort({ updatedAt: -1 })
    .populate("sharedWith", "name email avatar");
};

export const getTrashedFiles = async (userId: string): Promise<IFile[]> => {
  return File.find({ owner: userId, trashedAt: { $ne: null } })
    .sort({ trashedAt: -1 })
    .populate("sharedWith", "name email avatar");
};

const STORAGE_LIMIT_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB

export const getStorageStats = async (
  userId: string
): Promise<{ usedBytes: number; totalBytes: number; fileCount: number }> => {
  const result = await File.aggregate([
    { $match: { owner: new (require("mongoose").Types.ObjectId)(userId), trashedAt: null } },
    { $group: { _id: null, usedBytes: { $sum: "$size" }, fileCount: { $sum: 1 } } },
  ]);

  const usedBytes = result[0]?.usedBytes ?? 0;
  const fileCount = result[0]?.fileCount ?? 0;

  return { usedBytes, totalBytes: STORAGE_LIMIT_BYTES, fileCount };
};

export const toggleStar = async (
  fileId: string,
  userId: string
): Promise<IFile> => {
  const file = await File.findById(fileId);

  if (!file) throw new AppError("File not found", 404);
  if (file.owner.toString() !== userId)
    throw new AppError("Access denied", 403);

  file.starred = !file.starred;
  await file.save();

  logger.info(`File ${fileId} starred=${file.starred} by user ${userId}`);
  return file;
};

export const trashFile = async (
  fileId: string,
  userId: string
): Promise<IFile> => {
  const file = await File.findById(fileId);

  if (!file) throw new AppError("File not found", 404);
  if (file.owner.toString() !== userId)
    throw new AppError("Only the owner can trash this file", 403);

  file.trashedAt = new Date();
  await file.save();

  logger.info(`File trashed: ${file.filename} by user ${userId}`);
  return file;
};

export const restoreFile = async (
  fileId: string,
  userId: string
): Promise<IFile> => {
  const file = await File.findById(fileId);

  if (!file) throw new AppError("File not found", 404);
  if (file.owner.toString() !== userId)
    throw new AppError("Only the owner can restore this file", 403);

  file.trashedAt = null;
  await file.save();

  logger.info(`File restored: ${file.filename} by user ${userId}`);
  return file;
};

export const deleteFilePermanently = async (
  fileId: string,
  userId: string
): Promise<void> => {
  const file = await File.findById(fileId);

  if (!file) throw new AppError("File not found", 404);
  if (file.owner.toString() !== userId)
    throw new AppError("Only the owner can delete this file", 403);

  const pathOrKey = file.storageType === "s3" ? file.s3Key! : file.path!;
  await storageService.deleteFile(file.storageType, pathOrKey);
  await File.findByIdAndDelete(fileId);

  logger.info(`File permanently deleted: ${file.filename} by user ${userId}`);
};

export const deleteFile = async (
  fileId: string,
  userId: string
): Promise<void> => {
  return deleteFilePermanently(fileId, userId);
};

export const getFileById = async (
  fileId: string,
  userId: string
): Promise<IFile> => {
  const file = await File.findById(fileId).populate(
    "owner sharedWith",
    "name email avatar"
  );

  if (!file) throw new AppError("File not found", 404);

  const isOwner = file.owner._id.toString() === userId;
  const isShared = file.sharedWith.some(
    (user: any) => user._id.toString() === userId
  );

  if (!isOwner && !isShared) throw new AppError("Access denied", 403);

  return file;
};

export const renameFile = async (
  fileId: string,
  userId: string,
  newFilename: string
): Promise<IFile> => {
  const file = await File.findById(fileId);

  if (!file) throw new AppError("File not found", 404);
  if (file.owner.toString() !== userId)
    throw new AppError("Only the owner can rename this file", 403);

  const existing = await File.findOne({
    owner: userId,
    filename: newFilename,
    _id: { $ne: fileId },
  });

  if (existing) throw new AppError("A file with this name already exists", 409);

  file.filename = newFilename;
  await file.save();

  logger.info(`File renamed to: ${newFilename} by user ${userId}`);
  return file;
};

export const searchFiles = async (
  userId: string,
  query: string
): Promise<IFile[]> => {
  const regex = new RegExp(query, "i");

  return File.find({
    owner: userId,
    filename: regex,
    trashedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(50);
};

export const getFileDownloadUrl = async (
  fileId: string,
  userId: string
): Promise<string> => {
  const file = await getFileById(fileId, userId);

  const pathOrKey = file.storageType === "s3" ? file.s3Key! : file.path!;
  return storageService.getDownloadUrl(
    file.storageType,
    pathOrKey,
    file.filename
  );
};

export default {
  uploadFile,
  getUserFiles,
  getSharedFiles,
  getRecentFiles,
  getStarredFiles,
  getTrashedFiles,
  toggleStar,
  trashFile,
  restoreFile,
  deleteFilePermanently,
  deleteFile,
  getFileById,
  renameFile,
  searchFiles,
  getFileDownloadUrl,
};
