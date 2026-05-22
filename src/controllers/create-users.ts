import {Request, Response} from 'express'
import {prisma} from "../database/prisma";
import {z} from "zod";
import {AppError} from "../utils/AppError";
import {hash} from "bcrypt";

class CreateUserController {
    async create (req: Request, res: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3),
            email: z.string().email(),
            password: z.string().min(6)
        })

        const {name, email, password} = bodySchema.parse(req.body)

        const userWithSameEmail = await prisma.user.findUnique({where: {email}})

        if (userWithSameEmail){
            throw new AppError("Email already exists", 409)
        }

        const hashedPassword = await hash(password, 8)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        const {password: _, ...userWithoutPassword} = user

        return res.status(201).json({message: "User created successfully", user: userWithoutPassword})
    }
}

export {CreateUserController}