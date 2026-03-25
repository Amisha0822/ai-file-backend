import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/env";
import errorHandler from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import fileRoutes from "./routes/fileRoutes";
import shareRoutes from "./routes/shareRoutes";
import aiRoutes from "./routes/aiRoutes";
import logger from "./utils/logger";

const app: Application = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === "development") {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/ai", aiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

app.use(errorHandler);

export default app;
