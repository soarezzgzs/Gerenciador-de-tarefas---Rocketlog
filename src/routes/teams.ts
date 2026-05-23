import {Router} from "express"
import {CreateTeam} from "../controllers/create-team"
import {ensureAuthenticated} from "../middlewares/ensureAuthenticated"
import {verifyUserAuthorization} from "../middlewares/verifyUserAuthorization"

const teamRoutes = Router()

const createTeam = new CreateTeam()

teamRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]))
teamRoutes.post("/",createTeam.create)
teamRoutes.get("/",createTeam.index)
teamRoutes.patch("/:id",createTeam.patch)
teamRoutes.delete("/:id",createTeam.delete)


export {teamRoutes}