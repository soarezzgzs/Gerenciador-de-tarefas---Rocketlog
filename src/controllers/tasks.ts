import {Request, Response} from "express"
import {prisma} from "../database/prisma"
import {AppError} from "../utils/AppError"
import {z} from "zod"

class Tasks {
    async create (req: Request, res: Response) {
        const bodySchema = z.object({
            title: z.string().trim().min(3).max(100),
            description: z.string().trim().min(3).max(200),
            teamId: z.string().uuid(),
            status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
            priority: z.enum(["high", "medium", "low"]).default("medium"),
            assignedTo: z.string().uuid()
        })

        const {title, description, teamId, status, priority, assignedTo} = bodySchema.parse(req.body)

        if (req.user.role !== "admin") {
            throw new AppError("Insufficient permission", 403)
        }

        const team = await prisma.team.findFirst({where: {id: teamId}})

        const user = await prisma.user.findFirst({where: {id: assignedTo}})


        if (!user) {
            throw new AppError("User not found", 404)
        }

        if (!team) {
            throw new AppError("Team not found", 404)
        }

        const task = await prisma.task.create({
            data: {title, description, teamId, status, priority, assignedTo}
        })

        return res.status(201).json({task})

    }

    async index(req: Request, res: Response) {
    const querySchema = z.object({
        priority: z.enum(["high", "medium", "low"]).optional(),
        status: z.enum(["pending", "in_progress", "completed"]).optional()
    })

    const { priority, status } = querySchema.parse(req.query)

    const userId = req.user.id
    const role = req.user.role

    const filters: any = {}

    if (priority) {
        filters.priority = priority
    }

    if (status) {
        filters.status = status
    }

    const tasks = await prisma.task.findMany({
        where: role === "admin" ? { ...filters } : { assignedTo: userId, ...filters },
    })

    return res.status(200).json({ tasks })
}

    async update(req: Request, res: Response) {
    const paramSchema = z.object({
        id: z.string().uuid()
    })

    const bodySchema = z.object({
        title: z.string().trim().min(3).max(100),
        description: z.string().trim().min(3).max(200),
        teamId: z.string().uuid(),
        status: z.enum(["pending", "in_progress", "completed"]),
        priority: z.enum(["high", "medium", "low"]),
        assignedTo: z.string().uuid().optional()
    }).partial()

    const { id } = paramSchema.parse(req.params)
    const data = bodySchema.parse(req.body)

    const userId = req.user.id
    const role = req.user.role

    const team = await prisma.team.findFirst({ where: { id: data.teamId } })

    if (data.teamId && !team) {
        throw new AppError("Team not found", 404)
    }

    const task = await prisma.task.findUnique({
        where: { id }
    })

    if (!task) {
        throw new AppError("Task not found", 404)
    }

    if (Object.keys(data).length === 0) {
        throw new AppError("At least one field must be provided")
    }

    if (role !== "admin" && task.assignedTo !== userId) {
        throw new AppError("Insufficient permission", 403)
    }

    const updatedTask = await prisma.task.update({
        where: { id },
        data
    })

    if (data.status && data.status !== task.status) {
        await prisma.taskHistory.create({
            data: {
                taskId: id,
                changedById: userId,
                oldStatus: task.status,
                newStatus: data.status
            }
        })
    }

    return res.status(200).json(updatedTask)
}

    async delete (req: Request, res: Response){
        const paramSchema = z.object({
            id: z.string().uuid()
        })

        const {id} = paramSchema.parse(req.params)
        
        const task = await prisma.task.findFirst({where: {id}})
        const userId = req.user.id
        const role = req.user.role

        if(!id) {
            throw new AppError("Task not found", 404)
        }

        if (!task) {
            throw new AppError("Task not found", 404)
        }

        if (role !== "admin" && task.assignedTo !== userId) {
            throw new AppError("Insufficient permission", 403)
        }

        // await prisma.taskHistory.deleteMany({where: {taskId: id}})

        const taskVerified = await prisma.task.delete({where: {id}})

        if (!taskVerified) {
            throw new AppError("Task not found", 404)
        }

        return res.status(200).json(taskVerified)
    }
}

export {Tasks}