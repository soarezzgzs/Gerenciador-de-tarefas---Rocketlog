import {Request, Response, NextFunction} from "express"
import {AppError} from "../utils/AppError"

function verifyUserAuthorization(role: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!req.user?.id) {
            throw new AppError("User not found", 404)
        }

        if (!role.includes(req.user.role)) {
            throw new AppError("Insufficient permission", 403)
        }

        return next()
    }
}

export { verifyUserAuthorization }