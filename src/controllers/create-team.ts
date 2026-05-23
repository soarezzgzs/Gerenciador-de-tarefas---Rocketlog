import {Request, Response} from "express"
import {AppError} from "../utils/AppError"
import {prisma} from "../database/prisma"
import {z} from "zod"

class CreateTeam {
    async create(req: Request, res: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3),
            description: z.string().trim().min(3),
            userId: z.string()
        })

        const {name, description, userId} = bodySchema.parse(req.body)

        if (!userId) {
            throw new AppError("User not found", 404)
        }

        const user = await prisma.user.findUnique({where: {id: userId}})

        if (!user) {
            throw new AppError("User not found", 404)
        }

        if (user.role !== "admin") {
            throw new AppError("Insufficient permission", 403)
        }

        const teamWithSameName = await prisma.team.findFirst({where: {name}})

        if (teamWithSameName) {
            throw new AppError("Team name already exists")
        }

        if (!description) {
            throw new AppError("Team description is necessary.", 404)
        }


        const team = await prisma.team.create({
            data: {
                name,
                description
            }
        })

        return res.status(201).json({team})
    }

    async index(req: Request, res: Response) {
        const teams = await prisma.team.findMany()

        if (!teams) {
            throw new AppError("No have any teams.", 404)
        }


        return res.status(200).json({teams})
    }

    async patch(req: Request, res: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3),
            description: z.string().trim().min(3)
        }).partial()

        const paramSchema = z.object({
            id: z.string().uuid()
        })

        const data: any = {}

        const {name, description} = bodySchema.parse(req.body)

        const {id} = paramSchema.parse(req.params)

        if (!id) {
            throw new AppError("Team not found", 404)
        }

        if (!name && !description) {
            throw new AppError("Team name or description is necessary", 404)
        }

        const team = await prisma.team.update({
            where: {
                id
            },
            data: {
                name,
                description
            }
        })

        return res.status(200).json()
    }

    async delete(req: Request, res: Response) {
        const paramSchema = z.object({
            id: z.string().uuid()
        })

        const {id} = paramSchema.parse(req.params)

        if (!id) {
            throw new AppError("Team not found", 404)
        }


        const team = await prisma.team.delete({
            where: {
                id
            }
        })

        return res.status(200).json()
    }

}


export {CreateTeam}