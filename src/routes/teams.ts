import {Router} from "express"
import {CreateTeam} from "../controllers/create-team"
import {ensureAuthenticated} from "../middlewares/ensureAuthenticated"
import {verifyUserAuthorization} from "../middlewares/verifyUserAuthorization"

const teamRoutes = Router()

const createTeam = new CreateTeam()

teamRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]))
teamRoutes.post("/",verifyUserAuthorization(["admin"]),createTeam.create)
teamRoutes.get("/",verifyUserAuthorization(["admin"]) ,createTeam.index)
teamRoutes.patch("/:id",verifyUserAuthorization(["admin"]) ,createTeam.patch)
teamRoutes.delete("/:id",verifyUserAuthorization(["admin"]) ,createTeam.delete)


export {teamRoutes}