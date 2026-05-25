"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserAuthorization = verifyUserAuthorization;
const AppError_1 = require("../utils/AppError");
function verifyUserAuthorization(role) {
    return (req, res, next) => {
        if (!req.user?.id) {
            throw new AppError_1.AppError("User not found", 404);
        }
        if (!role.includes(req.user.role)) {
            throw new AppError_1.AppError("Insufficient permission", 403);
        }
        return next();
    };
}
