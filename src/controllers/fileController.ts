import { Response } from "express";
import { validationResult } from "express-validator";
import multer from "multer";
import { AuthenticatedRequest } from "../types";
import * as fileService from "../services/fileService";
import { catchAsync, AppError } from "../middlewares/errorHandler";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const uploadFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) throw new AppError("No file provided", 400);

    const file = await fileService.uploadFile({
      userId: req.user!.id,
      filename: req.file.originalname,
      originalName: req.file.originalname,
      buffer: req.file.buffer,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({ success: true, data: file });
  }
);

export const getFiles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const files = await fileService.getUserFiles(req.user!.id);
    res.json({ success: true, data: files });
  }
);

export const getSharedFiles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const files = await fileService.getSharedFiles(req.user!.id);
    res.json({ success: true, data: files });
  }
);

export const getRecentFiles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const files = await fileService.getRecentFiles(req.user!.id);
    res.json({ success: true, data: files });
  }
);

export const getStarredFiles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const files = await fileService.getStarredFiles(req.user!.id);
    res.json({ success: true, data: files });
  }
);

export const getTrashedFiles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const files = await fileService.getTrashedFiles(req.user!.id);
    res.json({ success: true, data: files });
  }
);

export const toggleStar = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const file = await fileService.toggleStar(req.params.id as string, req.user!.id);
    res.json({ success: true, data: file });
  }
);

export const trashFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const file = await fileService.trashFile(req.params.id as string, req.user!.id);
    res.json({ success: true, data: file });
  }
);

export const restoreFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const file = await fileService.restoreFile(req.params.id as string, req.user!.id);
    res.json({ success: true, data: file });
  }
);

export const deleteFilePermanently = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await fileService.deleteFilePermanently(req.params.id as string, req.user!.id);
    res.json({ success: true, message: "File permanently deleted" });
  }
);

export const getFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const file = await fileService.getFileById(req.params.id as string, req.user!.id);
    res.json({ success: true, data: file });
  }
);

export const deleteFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await fileService.deleteFile(req.params.id as string, req.user!.id);
    res.json({ success: true, message: "File deleted successfully" });
  }
);

export const renameFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const { filename } = req.body;
    const file = await fileService.renameFile(
      req.params.id as string,
      req.user!.id,
      filename
    );
    res.json({ success: true, data: file });
  }
);

export const searchFiles = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = (req.query.q as string) || "";
    if (!query) throw new AppError("Search query is required", 400);

    const files = await fileService.searchFiles(req.user!.id, query);
    res.json({ success: true, data: files });
  }
);

export const getStorageStats = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const stats = await fileService.getStorageStats(req.user!.id);
    res.json({ success: true, data: stats });
  }
);

export const getDownloadUrl = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const url = await fileService.getFileDownloadUrl(
      req.params.id as string,
      req.user!.id
    );
    res.json({ success: true, data: { url } });
  }
);
