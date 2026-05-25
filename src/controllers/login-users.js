"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUsers = exports.authConfig = void 0;
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
exports.authConfig = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: "1d" // ✅ VALOR CORRETO
    }
};
class LoginUsers {
    async create(req, res) {
        const bodySchema = zod_1.z.object({
            email: zod_1.z.string().email().trim().max(100),
            password: zod_1.z.string().min(6).max(100)
        });
        const { email, password } = bodySchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError_1.AppError("Email or password incorrect", 401);
        }
        const passwordMatch = await (0, bcrypt_1.compare)(password, user.password);
        if (!passwordMatch) {
            throw new AppError_1.AppError("Email or password incorrect", 401);
        }
        const { secret, expiresIn } = exports.authConfig.jwt;
        if (!secret) {
            throw new AppError_1.AppError("JWT secret not found", 500);
        }
        const token = (0, jsonwebtoken_1.sign)({ role: user.role ?? "member" }, secret, {
            subject: String(user.id),
            expiresIn // ✅ agora funciona sem erro
        });
        return res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    }
}
exports.LoginUsers = LoginUsers;
