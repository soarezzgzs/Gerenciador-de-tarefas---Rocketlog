import {Request, Response} from "express"
import {prisma} from "../database/prisma"
import {AppError} from "../utils/AppError"
import {z} from "zod"

class ShowLog {
    async index (req: Request, res: Response){
        const log = await prisma.taskHistory.findMany()

        if (!log) {
            throw new AppError("No have any log.", 404)
        }

        return res.status(200).json({log})
    }
}

export {ShowLog}