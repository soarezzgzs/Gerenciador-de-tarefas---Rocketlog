import {Router} from "express"

import {CreateUserController} from "../controllers/create-users"

const usersRoutes = Router()

const createUserController = new CreateUserController()

usersRoutes.post("/", createUserController.create)

export {usersRoutes}