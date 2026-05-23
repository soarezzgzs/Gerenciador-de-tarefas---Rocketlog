import {Router} from "express"

import {usersRoutes} from "./users-routes"
import {loginRoutes} from "./login-routes"
import {teamRoutes} from "./teams"
import {TeamUserRoutes} from "./create-teamUser"
import {taskRoutes} from "./tasks"

const routes = Router()

routes.use("/users", usersRoutes)
routes.use("/login", loginRoutes)
routes.use("/team", teamRoutes)
routes.use("/teamUser", TeamUserRoutes)
routes.use("/tasks", taskRoutes)

export {routes}