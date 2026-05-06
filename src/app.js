import express from 'express'
import cp from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import { config } from './config/config.js'
import productRouter from './routes/product.routes.js'
import cartRouter from './routes/cart.routes.js'
import orderRouter from './routes/order.routes.js'
import negociateRouter from './routes/negociate.routes.js'
import cors from 'cors'
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cp())

app.use(cors({
  origin: 'https://snitch-frontend-qedb.vercel.app',
  credentials: true
}));

app.use(passport.initialize())

passport.use(new GoogleStrategy({
   clientID : config.GOOGLE_CLIENT_ID,
   clientSecret : config.GOOGLE_CLIENT_SECRET,
   callbackURL : "/api/auth/google/callback"
} , (_ , __ , profile , done) =>{
    return done (null , profile)
}))

app.get("/" , (req , res) =>{
    res.send("Hello world")
})



app.use("/api/auth" , authRouter)
app.use("/api/product" , productRouter)
app.use('/api/cart' ,cartRouter )
app.use('/api/order' , orderRouter)
app.use('/api/negotiate' , negociateRouter)

export default app