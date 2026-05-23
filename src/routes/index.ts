import {Router} from "express"

import {usersRoutes} from "./users-routes"
import {loginRoutes} from "./login-routes"
import {teamRoutes} from "./teams"
import {TeamUserRoutes} from "./create-teamUser"

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/login", loginRoutes)
routes.use("/team", teamRoutes)
routes.use("/teamUser", TeamUserRoutes)

export {routes}