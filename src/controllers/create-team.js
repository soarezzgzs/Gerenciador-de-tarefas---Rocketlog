"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTeam = void 0;
const AppError_1 = require("../utils/AppError");
const prisma_1 = require("../database/prisma");
const zod_1 = require("zod");
class CreateTeam {
    async create(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().trim().min(3).max(50),
            description: zod_1.z.string().trim().min(3).max(100)
        });
        const { name, description } = bodySchema.parse(req.body);
        if (!req.user?.id) {
            throw new AppError_1.AppError("User not authenticated", 404);
        }
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError_1.AppError("User not found", 404);
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        if (user.role !== "admin") {
            throw new AppError_1.AppError("Insufficient permission", 403);
        }
        const teamWithSameName = await prisma_1.prisma.team.findFirst({ where: { name } });
        if (teamWithSameName) {
            throw new AppError_1.AppError("Team name already exists");
        }
        if (!description) {
            throw new AppError_1.AppError("Team description is necessary.", 404);
        }
        console.log(req.user);
        const team = await prisma_1.prisma.team.create({
            data: {
                name,
                description
            }
        });
        return res.status(201).json({ team });
    }
    async index(req, res) {
        const teams = await prisma_1.prisma.team.findMany();
        if (!teams) {
            throw new AppError_1.AppError("No have any teams.", 404);
        }
        return res.status(200).json({ teams });
    }
    async patch(req, res) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().trim().min(3),
            description: zod_1.z.string().trim().min(3)
        }).partial();
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid()
        });
        const data = {};
        const { name, description } = bodySchema.parse(req.body);
        const { id } = paramSchema.parse(req.params);
        if (!id) {
            throw new AppError_1.AppError("Team not found", 404);
        }
        if (!name && !description) {
            throw new AppError_1.AppError("Team name or description is necessary", 404);
        }
        const team = await prisma_1.prisma.team.update({
            where: {
                id
            },
            data: {
                name,
                description
            }
        });
        return res.status(200).json();
    }
    async delete(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid()
        });
        const { id } = paramSchema.parse(req.params);
        if (!id) {
            throw new AppError_1.AppError("Team not found", 404);
        }
        const team = await prisma_1.prisma.team.findUnique({ where: { id } });
        if (!team) {
            throw new AppError_1.AppError("Team not found", 404);
        }
        const teamDeleted = await prisma_1.prisma.team.delete({
            where: {
                id
            }
        });
        return res.status(200).json();
    }
}
exports.CreateTeam = CreateTeam;
