import {Request, Response} from "express"
import {prisma} from "../database/prisma"
import {AppError} from "../utils/AppError"
import {z} from "zod"

class Tasks {
    async create (req: Request, res: Response) {
        const bodySchema = z.object({
            title: z.string().trim().min(3),
            description: z.string().trim().min(3),
            teamId: z.string().uuid(),
            status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
            priority: z.enum(["high", "medium", "low"]).default("medium"),
            assignedTo: z.string().uuid()
        })

        const {title, description, teamId, status, priority, assignedTo} = bodySchema.parse(req.body)


        const team = await prisma.team.findFirst({where: {id: teamId}})

        const user = await prisma.user.findFirst({where: {id: assignedTo}})

        if (!user) {
            throw new AppError("User not found", 404)
        }

        if (!team) {
            throw new AppError("Team not found", 404)
        }

        const task = await prisma.task.create({data: {title, description, teamId, status, priority, assignedTo}})

        return res.status(201).json({task})

    }

    async index(req: Request, res: Response) {
    const querySchema = z.object({
        priority: z.enum(["high", "medium", "low"]).optional(),
        status: z.enum(["pending", "in_progress", "completed"]).optional()
    })

    const { priority, status } = querySchema.parse(req.query)

    const filters: any = {}

    if (priority) {
        filters.priority = priority
    }

    if (status) {
        filters.status = status
    }

    const tasks = await prisma.task.findMany({
        where: filters
    })

    return res.status(200).json({ tasks })
}

    async update (req: Request, res: Response) {
        const paramSchema = z.object({
            id: z.string().uuid()
        })

        const bodySchema = z.object({
            title: z.string().trim().min(3),
            description: z.string().trim().min(3),
            teamId: z.string().uuid(),
            status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
            priority: z.enum(["high", "medium", "low"]).default("medium"),
            assignedTo: z.string().uuid()
        }).partial()

        const {id} = paramSchema.parse(req.params)

        const {title, description, teamId, status, priority, assignedTo} = bodySchema.parse(req.body)

        const task = await prisma.task.update({where: {id}, data: {title, description, teamId, status, priority, assignedTo}})

        if(!task) {
            throw new AppError("Task not found", 404)
        }

        if(!teamId) {
            throw new AppError("Team not found", 404)
        }

        if(!assignedTo) {
            throw new AppError("User not found", 404)
        }

        return res.status(200).json()
    }

    async delete (req: Request, res: Response){
        const paramSchema = z.object({
            id: z.string().uuid()
        })

        const {id} = paramSchema.parse(req.params)

        if(!id) {
            throw new AppError("Task not found", 404)
        }

        const task = await prisma.task.delete({where: {id}})

        return res.status(200).json()
    }
}

export {Tasks}