import { Response } from "express";
import { validationResult } from "express-validator";
import { AuthenticatedRequest } from "../types";
import * as sharingService from "../services/sharingService";
import { catchAsync, AppError } from "../middlewares/errorHandler";

export const shareFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email } = req.body;
    const file = await sharingService.shareFile(
      req.params.id,
      req.user!.id,
      email
    );

    res.json({
      success: true,
      data: file,
      message: `File shared with ${email}`,
    });
  }
);

export const unshareFile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400);
    }

    const { email } = req.body;

    const file = await sharingService.unshareFile(
      req.params.id,
      req.user!.id,
      email
    );

    res.json({
      success: true,
      data: file,
      message: `File unshared with ${email}`,
    });
  }
);

export const getFileSharing = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const sharedWith = await sharingService.getFileSharing(
      req.params.id,
      req.user!.id
    );

    res.json({
      success: true,
      data: sharedWith,
    });
  }
);

export default {
  shareFile,
  unshareFile,
  getFileSharing,
};
