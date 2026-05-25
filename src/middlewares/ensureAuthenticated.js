"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const jsonwebtoken_1 = require("jsonwebtoken");
const login_users_1 = require("../controllers/login-users");
const AppError_1 = require("../utils/AppError");
function ensureAuthenticated(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppError_1.AppError("JWT token is missing", 401);
        }
        const [, token] = authHeader.split(" ");
        const { role, sub: user_id } = (0, jsonwebtoken_1.verify)(token, login_users_1.authConfig.jwt.secret);
        req.user = {
            id: user_id,
            role
        };
        return next();
    }
    catch (error) {
        throw new AppError_1.AppError("Invalid JWT token", 401);
    }
}
