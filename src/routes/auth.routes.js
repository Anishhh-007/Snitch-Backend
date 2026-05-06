import express from 'express'
import { getUser, googleCallBack, loginAuth, logoutAuth, registerAuth , setGoogleCookie } from '../controllers/auth.controllers.js'
import { validateLogin, validateRegister } from '../validator/auth.validator.js'
import passport from 'passport'
import { config } from '../config/config.js'
import userAuth from '../middleware/auth.middleware.js'

const authRouter = express.Router()

authRouter.post("/register" ,validateRegister ,registerAuth)
authRouter.post("/login" ,validateLogin ,loginAuth)
authRouter.post('/logout' , userAuth ,logoutAuth )
authRouter.get("/get-user" ,userAuth, getUser)
authRouter.post('/google/set-cookie', setGoogleCookie);
authRouter.get("/google" , passport.authenticate("google" , {
    scope : ["profile" , "email"]
}))  
authRouter.get("/google/callback" , passport.authenticate("google" , {session : false , 
    failureRedirect : config.VITE_URI+"/register"
} )
 , googleCallBack)


export default authRouter