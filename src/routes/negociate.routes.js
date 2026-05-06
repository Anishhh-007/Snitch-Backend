import express from 'express'
import userAuth from "../middleware/auth.middleware.js"
import { negociate } from '../controllers/negociate.controller.js'
const negociateRouter = express.Router()

negociateRouter.post('/' , userAuth , negociate)

export default negociateRouter