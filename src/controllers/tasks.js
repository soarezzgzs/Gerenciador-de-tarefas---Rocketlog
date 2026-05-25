"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tasks = void 0;
const prisma_1 = require("../database/prisma");
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
class Tasks {
    async create(req, res) {
        const bodySchema = zod_1.z.object({
            title: zod_1.z.string().trim().min(3).max(100),
            description: zod_1.z.string().trim().min(3).max(200),
            teamId: zod_1.z.string().uuid(),
            status: zod_1.z.enum(["pending", "in_progress", "completed"]).default("pending"),
            priority: zod_1.z.enum(["high", "medium", "low"]).default("medium"),
            assignedTo: zod_1.z.string().uuid().optional()
        });
        const { title, description, teamId, status, priority, assignedTo } = bodySchema.parse(req.body);
        if (req.user.role !== "admin") {
            throw new AppError_1.AppError("Insufficient permission", 403);
        }
        const team = await prisma_1.prisma.team.findFirst({ where: { id: teamId } });
        const user = await prisma_1.prisma.user.findFirst({ where: { id: assignedTo } });
        if (!user) {
            throw new AppError_1.AppError("User not found", 404);
        }
        if (!team) {
            throw new AppError_1.AppError("Team not found", 404);
        }
        console.log(req.user);
        const task = await prisma_1.prisma.task.create({
            data: {
                title,
                description,
                teamId,
                status,
                priority,
                assignedTo: assignedTo ?? req.user.id
            }
        });
        return res.status(201).json({ task });
    }
    async index(req, res) {
        const querySchema = zod_1.z.object({
            priority: zod_1.z.enum(["high", "medium", "low"]).optional(),
            status: zod_1.z.enum(["pending", "in_progress", "completed"]).optional()
        });
        const { priority, status } = querySchema.parse(req.query);
        const userId = req.user.id;
        const role = req.user.role;
        const filters = {};
        if (priority) {
            filters.priority = priority;
        }
        if (status) {
            filters.status = status;
        }
        const tasks = await prisma_1.prisma.task.findMany({
            where: role === "admin" ? { ...filters } : { assignedTo: userId, ...filters },
        });
        return res.status(200).json({ tasks });
    }
    async update(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid()
        });
        const bodySchema = zod_1.z.object({
            title: zod_1.z.string().trim().min(3).max(100),
            description: zod_1.z.string().trim().min(3).max(200),
            teamId: zod_1.z.string().uuid(),
            status: zod_1.z.enum(["pending", "in_progress", "completed"]),
            priority: zod_1.z.enum(["high", "medium", "low"]),
            assignedTo: zod_1.z.string().uuid().optional()
        }).partial();
        const { id } = paramSchema.parse(req.params);
        const data = bodySchema.parse(req.body);
        const userId = req.user.id;
        const role = req.user.role;
        const team = await prisma_1.prisma.team.findFirst({ where: { id: data.teamId } });
        if (data.teamId && !team) {
            throw new AppError_1.AppError("Team not found", 404);
        }
        const task = await prisma_1.prisma.task.findUnique({
            where: { id }
        });
        if (!task) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        if (Object.keys(data).length === 0) {
            throw new AppError_1.AppError("At least one field must be provided");
        }
        if (role !== "admin" && task.assignedTo !== userId) {
            throw new AppError_1.AppError("Insufficient permission", 403);
        }
        const updatedTask = await prisma_1.prisma.task.update({
            where: { id },
            data
        });
        if (data.status && data.status !== task.status) {
            await prisma_1.prisma.taskHistory.create({
                data: {
                    taskId: id,
                    changedById: userId,
                    oldStatus: task.status,
                    newStatus: data.status
                }
            });
        }
        return res.status(200).json(updatedTask);
    }
    async delete(req, res) {
        const paramSchema = zod_1.z.object({
            id: zod_1.z.string().uuid()
        });
        const { id } = paramSchema.parse(req.params);
        const task = await prisma_1.prisma.task.findFirst({ where: { id } });
        const userId = req.user.id;
        const role = req.user.role;
        if (!id) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        if (!task) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        if (role !== "admin" && task.assignedTo !== userId) {
            throw new AppError_1.AppError("Insufficient permission", 403);
        }
        // await prisma.taskHistory.deleteMany({where: {taskId: id}})
        const taskVerified = await prisma_1.prisma.task.delete({ where: { id } });
        if (!taskVerified) {
            throw new AppError_1.AppError("Task not found", 404);
        }
        return res.status(200).json(taskVerified);
    }
}
exports.Tasks = Tasks;
