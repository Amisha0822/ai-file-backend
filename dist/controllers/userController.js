"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = exports.getProfile = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService = __importStar(require("../services/userService"));
const errorHandler_1 = require("../middlewares/errorHandler");
const env_1 = __importDefault(require("../config/env"));
exports.getProfile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const user = await userService.findUserById(req.user.id);
    res.json({
        success: true,
        data: user,
    });
});
exports.syncUser = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const { googleId, email, name, avatar } = req.body;
    const user = await userService.findOrCreateUser({
        googleId,
        email,
        name,
        avatar,
    });
    const token = jsonwebtoken_1.default.sign({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        googleId: user.googleId,
    }, env_1.default.jwtSecret, { expiresIn: "7d" });
    res.json({
        success: true,
        data: user,
        token,
    });
});
exports.default = {
    getProfile: exports.getProfile,
    syncUser: exports.syncUser,
};
//# sourceMappingURL=userController.js.map