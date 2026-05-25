"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTeamUser = void 0;
const prisma_1 = require("../database/prisma");
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
class CreateTeamUser {
    async create(req, res) {
        const bodySchema = zod_1.z.object({
            userId: zod_1.z.string().uuid(),
            teamId: zod_1.z.string().uuid()
        });
        const { userId, teamId } = bodySchema.parse(req.body);
        const user = await prisma_1.prisma.user.findFirst({ where: { id: userId } });
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        const team = await prisma_1.prisma.team.findFirst({ where: { id: teamId } });
        if (!team) {
            throw new AppError_1.AppError("Team not found", 404);
        }
        const teamUser = await prisma_1.prisma.teamMember.create({ data: { userId, teamId } });
        return res.status(201).json({ teamUser });
    }
    async delete(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid()
        });
        const { id } = paramSchema.parse(req.params);
        const teamUser = await prisma_1.prisma.teamMember.delete({ where: { id } });
        return res.status(200).json();
    }
    async index(req, res) {
        const teamUser = await prisma_1.prisma.teamMember.findMany();
        if (!teamUser) {
            throw new AppError_1.AppError("No have any teamUser.", 404);
        }
        return res.status(200).json({ teamUser });
    }
}
exports.CreateTeamUser = CreateTeamUser;
