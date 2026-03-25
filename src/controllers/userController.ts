import { Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";
import * as userService from "../services/userService";
import { catchAsync } from "../middlewares/errorHandler";
import config from "../config/env";

export const getProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const user = await userService.findUserById(req.user!.id);

    res.json({
      success: true,
      data: user,
    });
  }
);

export const syncUser = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { googleId, email, name, avatar } = req.body;

    const user = await userService.findOrCreateUser({
      googleId,
      email,
      name,
      avatar,
    });

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        googleId: user.googleId,
      },
      config.jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: user,
      token,
    });
  }
);

export default {
  getProfile,
  syncUser,
};
