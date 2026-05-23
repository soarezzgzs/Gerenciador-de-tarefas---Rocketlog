import {Router} from 'express'
import {LoginUsers} from '../controllers/login-users'

const loginRoutes = Router()

const loginUsers = new LoginUsers()

loginRoutes.post("/", loginUsers.create)

export {loginRoutes}