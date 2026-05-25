"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowLog = void 0;
const prisma_1 = require("../database/prisma");
const AppError_1 = require("../utils/AppError");
class ShowLog {
    async index(req, res) {
        const log = await prisma_1.prisma.taskHistory.findMany();
        if (!log) {
            throw new AppError_1.AppError("No have any log.", 404);
        }
        return res.status(200).json({ log });
    }
}
exports.ShowLog = ShowLog;
