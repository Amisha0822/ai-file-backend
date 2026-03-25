"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByGoogleId = exports.findUserByEmail = exports.findUserById = exports.findOrCreateUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const logger_1 = __importDefault(require("../utils/logger"));
const findOrCreateUser = async (userData) => {
    try {
        let user = await User_1.default.findOne({ googleId: userData.googleId });
        if (user) {
            user.name = userData.name;
            user.email = userData.email;
            if (userData.avatar) {
                user.avatar = userData.avatar;
            }
            await user.save();
            logger_1.default.info(`User logged in: ${user.email}`);
            return user;
        }
        user = await User_1.default.create(userData);
        logger_1.default.info(`New user created: ${user.email}`);
        return user;
    }
    catch (error) {
        logger_1.default.error("Error in findOrCreateUser:", error);
        throw error;
    }
};
exports.findOrCreateUser = findOrCreateUser;
const findUserById = async (userId) => {
    return User_1.default.findById(userId);
};
exports.findUserById = findUserById;
const findUserByEmail = async (email) => {
    return User_1.default.findOne({ email: email.toLowerCase() });
};
exports.findUserByEmail = findUserByEmail;
const findUserByGoogleId = async (googleId) => {
    return User_1.default.findOne({ googleId });
};
exports.findUserByGoogleId = findUserByGoogleId;
exports.default = {
    findOrCreateUser: exports.findOrCreateUser,
    findUserById: exports.findUserById,
    findUserByEmail: exports.findUserByEmail,
    findUserByGoogleId: exports.findUserByGoogleId,
};
//# sourceMappingURL=userService.js.map