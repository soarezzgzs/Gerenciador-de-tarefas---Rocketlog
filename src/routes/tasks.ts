import {Router} from "express"
import {Tasks} from "../controllers/tasks"
import {ensureAuthenticated} from "../middlewares/ensureAuthenticated"

const taskRoutes = Router()

const tasks = new Tasks()

taskRoutes.use(ensureAuthenticated)
taskRoutes.post("/",tasks.create)
taskRoutes.get("/", tasks.index)
taskRoutes.patch("/:id", tasks.update)
taskRoutes.delete("/:id", tasks.delete)

export {taskRoutes}