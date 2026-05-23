import {Router} from "express"
import {CreateTeamUser} from "../controllers/team-user"
import {verifyUserAuthorization} from "../middlewares/verifyUserAuthorization"
import {ensureAuthenticated} from "../middlewares/ensureAuthenticated"
import {ListTeamUser} from "../controllers/list-teamUser"

const TeamUserRoutes = Router()

const createTeamUser = new CreateTeamUser()


TeamUserRoutes.post("/",ensureAuthenticated ,verifyUserAuthorization(["admin"]), createTeamUser.create)
TeamUserRoutes.delete("/:id",ensureAuthenticated ,verifyUserAuthorization(["admin"]), createTeamUser.delete)
TeamUserRoutes.get("/", ensureAuthenticated, createTeamUser.index)

export {TeamUserRoutes}
