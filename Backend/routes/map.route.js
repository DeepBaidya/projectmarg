import express from 'express'
import { mapGet, setCityDatabase, setRoadCondition, setRoadDatabase } from '../controllers/map.controller.js'
import {singleUpload} from "../middlewares/multer.middlewares.js"

const Router = express.Router()

//Routes

Router.route("/get").post(mapGet)
Router.route("/setcity").post(setCityDatabase)
Router.route("/setroad/:id").post(setRoadDatabase)
Router.route("/setcondition").post(singleUpload,setRoadCondition)

export default Router