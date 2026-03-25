import { body, ValidationChain } from "express-validator";

export const validateRenameFile = (): ValidationChain[] => {
  return [
    body("filename")
      .trim()
      .notEmpty()
      .withMessage("Filename is required")
      .isLength({ min: 1, max: 255 })
      .withMessage("Filename must be between 1 and 255 characters")
      .matches(/^[^<>:"/\\|?*\x00-\x1F]+$/)
      .withMessage("Filename contains invalid characters"),
  ];
};

export const validateShareFile = (): ValidationChain[] => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
  ];
};

export const validateSearch = (): ValidationChain[] => {
  return [
    body("query")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Search query must be between 1 and 100 characters"),
  ];
};

export default {
  validateRenameFile,
  validateShareFile,
  validateSearch,
};
