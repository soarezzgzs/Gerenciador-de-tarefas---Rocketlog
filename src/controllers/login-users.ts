import { Request, Response } from 'express'
import { prisma } from "../database/prisma"
import { z } from "zod"
import { AppError } from "../utils/AppError"
import { compare } from "bcrypt"
import { sign, SignOptions } from "jsonwebtoken"

export const authConfig: {
  jwt: {
    secret: string
    expiresIn: SignOptions["expiresIn"]
  }
} = {
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: "1d" // ✅ VALOR CORRETO
  }
}

class LoginUsers {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z.string().email().trim().max(100),
      password: z.string().min(6).max(100)
    })

    const { email, password } = bodySchema.parse(req.body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new AppError("Email or password incorrect", 401)
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      throw new AppError("Email or password incorrect", 401)
    }

    const { secret, expiresIn } = authConfig.jwt

    if (!secret) {
      throw new AppError("JWT secret not found", 500)
    }

    const token = sign(
      { role: user.role ?? "member" },
      secret,
      {
        subject: String(user.id),
        expiresIn // ✅ agora funciona sem erro
      }
    )

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    })
  }
}

export { LoginUsers }
