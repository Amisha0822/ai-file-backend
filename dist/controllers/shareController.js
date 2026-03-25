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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileSharing = exports.unshareFile = exports.shareFile = void 0;
const express_validator_1 = require("express-validator");
const sharingService = __importStar(require("../services/sharingService"));
const errorHandler_1 = require("../middlewares/errorHandler");
exports.shareFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.AppError(errors.array()[0].msg, 400);
    }
    const { email } = req.body;
    const file = await sharingService.shareFile(req.params.id, req.user.id, email);
    res.json({
        success: true,
        data: file,
        message: `File shared with ${email}`,
    });
});
exports.unshareFile = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.AppError(errors.array()[0].msg, 400);
    }
    const { email } = req.body;
    const file = await sharingService.unshareFile(req.params.id, req.user.id, email);
    res.json({
        success: true,
        data: file,
        message: `File unshared with ${email}`,
    });
});
exports.getFileSharing = (0, errorHandler_1.catchAsync)(async (req, res) => {
    const sharedWith = await sharingService.getFileSharing(req.params.id, req.user.id);
    res.json({
        success: true,
        data: sharedWith,
    });
});
exports.default = {
    shareFile: exports.shareFile,
    unshareFile: exports.unshareFile,
    getFileSharing: exports.getFileSharing,
};
//# sourceMappingURL=shareController.js.map