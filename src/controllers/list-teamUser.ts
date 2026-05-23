import {Request, Response} from "express"
import {prisma} from "../database/prisma"
import {AppError} from "../utils/AppError"
import {z} from "zod"

class ListTeamUser{
    async index(req: Request, res: Response){
        const teamUser = await prisma.teamMember.findMany()

        if (!teamUser) {
            throw new AppError("No have any teamUser.", 404)
        }

        return res.status(200).json({teamUser})
    }
}

export {ListTeamUser}