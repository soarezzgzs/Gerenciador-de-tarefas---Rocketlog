import {Request, Response} from 'express'
import {prisma} from "../database/prisma";
import {z} from "zod";
import {AppError} from "../utils/AppError";
import {hash} from "bcrypt";

class CreateUserController {
    async create (req: Request, res: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3).max(50),
            email: z.string().email().trim().max(100),
            password: z.string().min(6).max(100),
            role: z.enum(["admin", "member"]).default("member").optional()
        })

        const {name, email, password, role} = bodySchema.parse(req.body)

        const userWithSameEmail = await prisma.user.findUnique({where: {email}})

        if (userWithSameEmail){
            throw new AppError("Email already exists", 409)
        }

        if (!password) {
            throw new AppError("Password is necessary", 400)
        }

        const hashedPassword = await hash(password, 8)

        if (!hashedPassword) {
            throw new AppError("Password not hashed", 500)
        }

        if (!name || !email || !password) {
            throw new AppError("All fields are necessary", 400)
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })

        const {password: _, ...userWithoutPassword} = user

        return res.status(201).json({message: "User created successfully", user: userWithoutPassword})
    }
}

export {CreateUserController}