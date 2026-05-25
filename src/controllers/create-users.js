"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserController = void 0;
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const bcrypt_1 = require("bcrypt");
class CreateUserController {
    async create(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().trim().min(3).max(50),
            email: zod_1.z.string().email().trim().max(100),
            password: zod_1.z.string().min(6).max(100),
            role: zod_1.z.enum(["admin", "member"]).default("member").optional()
        });
        const { name, email, password, role } = bodySchema.parse(req.body);
        const userWithSameEmail = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (userWithSameEmail) {
            throw new AppError_1.AppError("Email already exists", 409);
        }
        if (!password) {
            throw new AppError_1.AppError("Password is necessary", 400);
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 8);
        if (!hashedPassword) {
            throw new AppError_1.AppError("Password not hashed", 500);
        }
        if (!name || !email || !password) {
            throw new AppError_1.AppError("All fields are necessary", 400);
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json({ message: "User created successfully", user: userWithoutPassword });
    }
}
exports.CreateUserController = CreateUserController;
