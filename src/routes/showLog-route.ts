import {Router} from "express"
import {ShowLog} from "../controllers/show-log"
import {ensureAuthenticated} from "../middlewares/ensureAuthenticated"
import {verifyUserAuthorization} from "../middlewares/verifyUserAuthorization"

const showLogRoutes = Router()

const showLog = new ShowLog()

showLogRoutes.use(ensureAuthenticated, verifyUserAuthorization(["admin"]))
showLogRoutes.get("/", showLog.index)

export {showLogRoutes}