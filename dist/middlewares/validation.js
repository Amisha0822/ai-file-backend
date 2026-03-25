"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearch = exports.validateShareFile = exports.validateRenameFile = void 0;
const express_validator_1 = require("express-validator");
const validateRenameFile = () => {
    return [
        (0, express_validator_1.body)("filename")
            .trim()
            .notEmpty()
            .withMessage("Filename is required")
            .isLength({ min: 1, max: 255 })
            .withMessage("Filename must be between 1 and 255 characters")
            .matches(/^[^<>:"/\\|?*\x00-\x1F]+$/)
            .withMessage("Filename contains invalid characters"),
    ];
};
exports.validateRenameFile = validateRenameFile;
const validateShareFile = () => {
    return [
        (0, express_validator_1.body)("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email format")
            .normalizeEmail(),
    ];
};
exports.validateShareFile = validateShareFile;
const validateSearch = () => {
    return [
        (0, express_validator_1.body)("query")
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage("Search query must be between 1 and 100 characters"),
    ];
};
exports.validateSearch = validateSearch;
exports.default = {
    validateRenameFile: exports.validateRenameFile,
    validateShareFile: exports.validateShareFile,
    validateSearch: exports.validateSearch,
};
//# sourceMappingURL=validation.js.map