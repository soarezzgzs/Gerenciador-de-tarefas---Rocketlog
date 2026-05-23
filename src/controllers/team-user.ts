import {Request, Response} from "express"
import {prisma} from "../database/prisma"
import {AppError} from "../utils/AppError"
import {z} from "zod"

class CreateTeamUser {
    async create(req: Request, res: Response){
        const bodySchema = z.object({
            userId: z.string().uuid(),
            teamId: z.string().uuid()
        })

        const {userId, teamId} = bodySchema.parse(req.body)

        const user = await prisma.user.findFirst({where: {id: userId}})

        if (!user) {
            throw new AppError("User not found", 404)
        }

        const team = await prisma.team.findFirst({where: {id: teamId}})

        if (!team) {
            throw new AppError("Team not found", 404)
        }

        const teamUser = await prisma.teamMember.create({data: {userId, teamId}})

        return res.status(201).json({teamUser})
    }

    async delete (req: Request, res: Response) {
        const paramSchema = z.object({
            id: z.string().uuid()
        })

        const {id} = paramSchema.parse(req.params)

        const teamUser = await prisma.teamMember.delete({where: {id}})

        return res.status(200).json()
}
    async index(req: Request, res: Response){
        const teamUser = await prisma.teamMember.findMany()

        if (!teamUser) {
            throw new AppError("No have any teamUser.", 404)
        }

        return res.status(200).json({teamUser})
    }
}

export {CreateTeamUser}