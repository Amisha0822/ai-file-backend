"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = __importDefault(require("./config/env"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const shareRoutes_1 = __importDefault(require("./routes/shareRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.default.frontendUrl,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
if (env_1.default.nodeEnv === "development") {
    app.use((req, _res, next) => {
        logger_1.default.debug(`${req.method} ${req.path}`);
        next();
    });
}
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: env_1.default.nodeEnv,
    });
});
app.use("/api/users", userRoutes_1.default);
app.use("/api/files", fileRoutes_1.default);
app.use("/api/share", shareRoutes_1.default);
app.use("/api/ai", aiRoutes_1.default);
app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.path,
    });
});
app.use(errorHandler_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map